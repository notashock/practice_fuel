package com.fuel_monitor.server.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fuel_monitor.server.dtos.request.FuelLogRequest;
import com.fuel_monitor.server.exceptions.BusinessRuleException;
import com.fuel_monitor.server.exceptions.GlobalExceptionHandler;
import com.fuel_monitor.server.models.entities.FuelLog;
import com.fuel_monitor.server.models.entities.User;
import com.fuel_monitor.server.models.entities.Vehicle;
import com.fuel_monitor.server.models.entities.VehicleCost;
import com.fuel_monitor.server.models.enums.FuelType;
import com.fuel_monitor.server.repositories.FuelLogRepository;
import com.fuel_monitor.server.repositories.VehicleCostRepository;
import com.fuel_monitor.server.services.FuelService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class FuelControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock private FuelService fuelService;
    @Mock private FuelLogRepository fuelLogRepository;
    @Mock private VehicleCostRepository costRepository;

    @InjectMocks
    private FuelController fuelController;

    private User testDriver;
    private Vehicle testVehicle;
    private FuelLogRequest validRequest;
    private FuelLog savedLog;

    @BeforeEach
    void setUp() {
        testDriver = User.builder().id(5L).email("driver5@fleet.com").build();

        // Standalone Setup to bypass Security and inject our testDriver
        mockMvc = MockMvcBuilders.standaloneSetup(fuelController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(new HandlerMethodArgumentResolver() {
                    @Override
                    public boolean supportsParameter(MethodParameter parameter) {
                        return parameter.getParameterType().isAssignableFrom(User.class);
                    }
                    @Override
                    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer, NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                        return testDriver;
                    }
                })
                .build();

        testVehicle = Vehicle.builder().id(1L).build();

        validRequest = FuelLogRequest.builder()
                .fuelAmountLiters(50.0)
                .fuelCost(4500.0) // Cost in INR
                .odometerAtRefill(10500.0)
                .fuelType(FuelType.DIESEL)
                .build();

        savedLog = FuelLog.builder()
                .id(1L)
                .vehicle(testVehicle) // Crucial: The controller extracts this vehicle to build the auto-cost
                .fuelAmountLiters(50.0)
                .fuelCost(4500.0)
                .odometerAtRefill(10500.0)
                .build();
    }

    @Test
    void logFuel_Returns200_AndGeneratesAutoCostEntry() throws Exception {
        // Arrange: Mock the service to return our saved log
        Mockito.when(fuelService.logFuel(eq(1L), eq(5L), any(FuelLog.class))).thenReturn(savedLog);

        // Mock the cost repository to catch the auto-generated ledger entry
        Mockito.when(costRepository.save(any(VehicleCost.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act & Assert
        mockMvc.perform(post("/api/fuel-logs/vehicle/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fuelCost").value(4500.0))
                .andExpect(jsonPath("$.odometerAtRefill").value(10500.0));

        // CRITICAL VERIFICATION: Prove that the ledger entry was automatically generated
        Mockito.verify(costRepository, Mockito.times(1)).save(Mockito.argThat(cost ->
                cost.getAmount() == 4500.0 &&
                        cost.getRemarks().contains("Driver ID: 5")
        ));
    }

    @Test
    void logFuel_Returns400_WhenBusinessRuleFails_AndDoesNotGenerateCost() throws Exception {
        // Arrange: Force the FuelService to throw an exception (e.g., Odometer strictly increasing rule failed)
        Mockito.when(fuelService.logFuel(eq(1L), eq(5L), any(FuelLog.class)))
                .thenThrow(new BusinessRuleException("Odometer reading must be strictly increasing"));

        // Act & Assert
        mockMvc.perform(post("/api/fuel-logs/vehicle/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Odometer reading must be strictly increasing"));

        // Prove that because the fuel log failed, the financial ledger was NEVER touched
        Mockito.verify(costRepository, Mockito.never()).save(any());
    }

    @Test
    void getFuelLogsByVehicle_ReturnsList() throws Exception {
        // Arrange
        Mockito.when(fuelLogRepository.findByVehicleIdOrderByRefillDateDesc(1L))
                .thenReturn(Arrays.asList(savedLog));

        // Act & Assert
        mockMvc.perform(get("/api/fuel-logs/vehicle/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].fuelCost").value(4500.0));
    }
}