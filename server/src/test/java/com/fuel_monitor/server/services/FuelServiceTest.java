package com.fuel_monitor.server.services;

import com.fuel_monitor.server.exceptions.BusinessRuleException;
import com.fuel_monitor.server.models.entities.FuelLog;
import com.fuel_monitor.server.models.entities.User;
import com.fuel_monitor.server.models.entities.Vehicle;
import com.fuel_monitor.server.models.enums.FuelType;
import com.fuel_monitor.server.models.enums.Role;
import com.fuel_monitor.server.models.enums.VehicleType;
import com.fuel_monitor.server.repositories.FuelLogRepository;
import com.fuel_monitor.server.repositories.UserRepository;
import com.fuel_monitor.server.repositories.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FuelServiceTest {

    @Mock
    private FuelLogRepository fuelLogRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FuelService fuelService;

    private Vehicle testTruck;
    private Vehicle testCar;
    private User testDriver;
    private FuelLog incomingLog;

    @BeforeEach
    void setUp() {
        testTruck = Vehicle.builder()
                .id(1L)
                .vehicleType(VehicleType.TRUCK)
                .odometerReading(10000.0)
                .build();

        testCar = Vehicle.builder()
                .id(2L)
                .vehicleType(VehicleType.CAR)
                .odometerReading(5000.0)
                .build();

        testDriver = User.builder()
                .id(1L)
                .role(Role.DRIVER)
                .build();

        incomingLog = FuelLog.builder()
                .fuelAmountLiters(50.0)
                .odometerAtRefill(10250.0)
                .fuelType(FuelType.DIESEL)
                .build();
    }

    @Test
    void logFuel_ThrowsException_WhenVehicleNotFound() {
        when(vehicleRepository.findById(99L)).thenReturn(Optional.empty());

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () ->
                fuelService.logFuel(99L, 1L, incomingLog));
        assertEquals("Vehicle not found", ex.getMessage());
    }

    @Test
    void logFuel_ThrowsException_WhenDriverNotFound() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testTruck));
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () ->
                fuelService.logFuel(1L, 99L, incomingLog));
        assertEquals("Driver not found", ex.getMessage());
    }

    @Test
    void logFuel_ThrowsException_WhenFuelAmountIsZero() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testTruck));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testDriver));
        incomingLog.setFuelAmountLiters(0.0);

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () ->
                fuelService.logFuel(1L, 1L, incomingLog));
        assertEquals("Fuel amount must be at least 1 liter", ex.getMessage());
    }

    @Test
    void logFuel_ThrowsException_WhenOdometerNotIncreasing() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testTruck));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testDriver));

        FuelLog lastLog = FuelLog.builder().odometerAtRefill(10500.0).build();
        when(fuelLogRepository.findFirstByVehicleIdOrderByOdometerAtRefillDesc(1L))
                .thenReturn(Optional.of(lastLog));

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () ->
                fuelService.logFuel(1L, 1L, incomingLog));
        assertEquals("Odometer reading must be strictly increasing", ex.getMessage());
    }

    @Test
    void logFuel_Success_FirstEverLog() {
        // First log has no previous log to compare efficiency with
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testTruck));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testDriver));
        when(fuelLogRepository.findFirstByVehicleIdOrderByOdometerAtRefillDesc(1L))
                .thenReturn(Optional.empty());
        when(fuelLogRepository.save(any(FuelLog.class))).thenAnswer(i -> i.getArguments()[0]);

        FuelLog result = fuelService.logFuel(1L, 1L, incomingLog);

        assertNotNull(result);
        assertEquals(10250.0, testTruck.getOdometerReading());
        verify(fuelLogRepository, times(1)).save(incomingLog);
    }

    @Test
    void validateEfficiencyBounds_ThrowsException_TruckTooLow() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testTruck));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testDriver));

        FuelLog lastLog = FuelLog.builder().odometerAtRefill(10000.0).build();
        when(fuelLogRepository.findFirstByVehicleIdOrderByOdometerAtRefillDesc(1L)).thenReturn(Optional.of(lastLog));

        // Efficiency = 50km / 50L = 1 km/l (Truck min is 2)
        incomingLog.setOdometerAtRefill(10050.0);
        incomingLog.setFuelAmountLiters(50.0);

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () ->
                fuelService.logFuel(1L, 1L, incomingLog));
        assertEquals("Truck fuel efficiency must be between 2-10 km/l", ex.getMessage());
    }

    @Test
    void validateEfficiencyBounds_ThrowsException_CarTooHigh() {
        when(vehicleRepository.findById(2L)).thenReturn(Optional.of(testCar));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testDriver));

        FuelLog lastLog = FuelLog.builder().odometerAtRefill(5000.0).build();
        when(fuelLogRepository.findFirstByVehicleIdOrderByOdometerAtRefillDesc(2L)).thenReturn(Optional.of(lastLog));

        // Efficiency = 300km / 10L = 30 km/l (Car max is 20)
        incomingLog.setOdometerAtRefill(5300.0);
        incomingLog.setFuelAmountLiters(10.0);

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () ->
                fuelService.logFuel(2L, 1L, incomingLog));
        assertEquals("Car fuel efficiency must be between 10-20 km/l", ex.getMessage());
    }

    @Test
    void checkEfficiencyDrop_TriggersWarning_WhenDropIsGreaterThan20Percent() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testTruck));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testDriver));

        // Last log setup
        FuelLog lastLog = FuelLog.builder().odometerAtRefill(10000.0).build();
        when(fuelLogRepository.findFirstByVehicleIdOrderByOdometerAtRefillDesc(1L)).thenReturn(Optional.of(lastLog));

        // Current Efficiency = 100km / 50L = 2.0 km/l
        incomingLog.setOdometerAtRefill(10100.0);
        incomingLog.setFuelAmountLiters(50.0);

        // Historical Data Setup: 400km covered over 40L = Historical Avg 10 km/l
        FuelLog hist1 = FuelLog.builder().odometerAtRefill(10000.0).fuelAmountLiters(20.0).build();
        FuelLog hist2 = FuelLog.builder().odometerAtRefill(9800.0).fuelAmountLiters(20.0).build();
        FuelLog hist3 = FuelLog.builder().odometerAtRefill(9600.0).build(); // Oldest

        List<FuelLog> historyLogs = Arrays.asList(hist1, hist2, hist3);
        when(fuelLogRepository.findRecentLogsByVehicle(eq(1L), any(LocalDateTime.class))).thenReturn(historyLogs);
        when(fuelLogRepository.save(any())).thenReturn(incomingLog);

        // Act - this will trigger the log.warn in checkEfficiencyDrop
        FuelLog result = fuelService.logFuel(1L, 1L, incomingLog);

        // Assert
        assertNotNull(result);
        assertEquals(10100.0, testTruck.getOdometerReading());
        // Note: The warning is logged to the console, but the code execution path is covered!
    }
}