package com.fuel_monitor.server.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fuel_monitor.server.dtos.request.VehicleCostRequest;
import com.fuel_monitor.server.exceptions.GlobalExceptionHandler;
import com.fuel_monitor.server.models.entities.Vehicle;
import com.fuel_monitor.server.models.entities.VehicleCost;
import com.fuel_monitor.server.models.enums.CostType;
import com.fuel_monitor.server.repositories.VehicleCostRepository;
import com.fuel_monitor.server.repositories.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CostControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private VehicleCostRepository costRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private CostController costController;

    private Vehicle testVehicle;
    private VehicleCostRequest validRequest;
    private VehicleCost savedCost;

    @BeforeEach
    void setUp() {
        // Standalone Setup to bypass Security contexts entirely
        mockMvc = MockMvcBuilders.standaloneSetup(costController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        testVehicle = Vehicle.builder().id(1L).build();

//        validRequest = VehicleRequestCostBuilder(); // Helper method conceptualization, mapped below
        validRequest = VehicleCostRequest.builder()
                .vehicleId(1L)
                .costType(CostType.INSURANCE) // Testing a manual cost entry
                .amount(12000.0)
                .remarks("Annual Insurance Renewal")
                .build();

        savedCost = VehicleCost.builder()
                .id(1L)
                .vehicle(testVehicle)
                .costType(CostType.INSURANCE)
                .amount(12000.0)
                .remarks("Annual Insurance Renewal")
                .build();
    }

    @Test
    void recordCost_Returns200_WhenValidRequest() throws Exception {
        Mockito.when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        Mockito.when(costRepository.save(any(VehicleCost.class))).thenReturn(savedCost);

        mockMvc.perform(post("/api/costs/record")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(12000.0))
                .andExpect(jsonPath("$.costType").value("INSURANCE"));
    }

    @Test
    void recordCost_Returns400_WhenVehicleNotFound() throws Exception {
        Mockito.when(vehicleRepository.findById(1L)).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/costs/record")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Vehicle not found"));

        Mockito.verify(costRepository, Mockito.never()).save(any());
    }

    @Test
    void getCostSummary_Returns200_WithValidSum() throws Exception {
        // Arrange: The DB finds 5000.0 worth of maintenance costs
        Mockito.when(costRepository.getTotalCostByVehicleAndTypeAndYear(eq(1L), eq(CostType.MAINTENANCE), eq(2026)))
                .thenReturn(5000.0);

        // Act & Assert
        mockMvc.perform(get("/api/costs/summary")
                        .param("vehicleId", "1")
                        .param("year", "2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vehicleId").value(1))
                .andExpect(jsonPath("$.year").value(2026))
                .andExpect(jsonPath("$.totalMaintenanceCost").value(5000.0));
    }

    @Test
    void getCostSummary_Returns200_WithZero_WhenNoCostsExist() throws Exception {
        // Arrange: The DB finds NOTHING and returns null (testing your ternary operator!)
        Mockito.when(costRepository.getTotalCostByVehicleAndTypeAndYear(eq(1L), eq(CostType.MAINTENANCE), eq(2026)))
                .thenReturn(null);

        // Act & Assert
        mockMvc.perform(get("/api/costs/summary")
                        .param("vehicleId", "1")
                        .param("year", "2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalMaintenanceCost").value(0.0)); // Proves your null-check works perfectly
    }
}