package com.fuel_monitor.server.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fuel_monitor.server.dtos.request.VehicleRequest;
import com.fuel_monitor.server.exceptions.GlobalExceptionHandler;
import com.fuel_monitor.server.models.entities.Vehicle;
import com.fuel_monitor.server.models.enums.FuelType;
import com.fuel_monitor.server.models.enums.VehicleStatus;
import com.fuel_monitor.server.models.enums.VehicleType;
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

import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class) // Pure Mockito, zero Spring Boot context loading!
class VehicleControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper = new ObjectMapper(); // Instantiated directly, no Autowiring needed

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private VehicleController vehicleController;

    private VehicleRequest validRequest;
    private Vehicle savedVehicle;

    @BeforeEach
    void setUp() {
        // THE CHEAT CODE: This builds the controller environment standalone.
        // It completely bypasses Spring Security and missing Autoconfigure jars!
        mockMvc = MockMvcBuilders.standaloneSetup(vehicleController)
                .setControllerAdvice(new GlobalExceptionHandler()) // Still intercepts your 400 errors perfectly
                .build();

        validRequest = VehicleRequest.builder()
                .registrationNumber("KA01AB1234")
                .vehicleType(VehicleType.TRUCK)
                .fuelType(FuelType.DIESEL)
                .odometerReading(1000.0)
                .build();

        savedVehicle = Vehicle.builder()
                .id(1L)
                .registrationNumber("KA01AB1234")
                .vehicleType(VehicleType.TRUCK)
                .odometerReading(1000.0)
                .status(VehicleStatus.ACTIVE)
                .build();
    }

    @Test
    void registerVehicle_Returns200_WhenValidRequest() throws Exception {
        Mockito.when(vehicleRepository.save(any(Vehicle.class))).thenReturn(savedVehicle);

        mockMvc.perform(post("/api/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.registrationNumber").value("KA01AB1234"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void registerVehicle_Returns400_WhenRegistrationFormatIsInvalid() throws Exception {
        validRequest.setRegistrationNumber("INVALID123");

        mockMvc.perform(post("/api/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Registration number format must be XX00XX0000 (e.g., KA01AB1234)"));
    }

    @Test
    void getAllVehicles_ReturnsListOfVehicles() throws Exception {
        Mockito.when(vehicleRepository.findAll()).thenReturn(Arrays.asList(savedVehicle));

        mockMvc.perform(get("/api/vehicles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].registrationNumber").value("KA01AB1234"));
    }

    @Test
    void updateOdometer_Returns200_WhenReadingIsHigher() throws Exception {
        Mockito.when(vehicleRepository.findById(1L)).thenReturn(Optional.of(savedVehicle));
        Mockito.when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(i -> i.getArguments()[0]);

        mockMvc.perform(put("/api/vehicles/1/odometer")
                        .param("reading", "1500.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.odometerReading").value(1500.0));
    }

    @Test
    void updateOdometer_Returns400_WhenReadingIsLower() throws Exception {
        Mockito.when(vehicleRepository.findById(1L)).thenReturn(Optional.of(savedVehicle));

        mockMvc.perform(put("/api/vehicles/1/odometer")
                        .param("reading", "500.0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Odometer reading must be greater than or equal to the previous reading"));
    }
}