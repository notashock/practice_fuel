package com.fuel_monitor.server.services;

import com.fuel_monitor.server.exceptions.BusinessRuleException;
import com.fuel_monitor.server.models.entities.MaintenanceSchedule;
import com.fuel_monitor.server.models.entities.Vehicle;
import com.fuel_monitor.server.models.enums.ScheduleStatus;
import com.fuel_monitor.server.models.enums.ScheduleType;
import com.fuel_monitor.server.repositories.MaintenanceScheduleRepository;
import com.fuel_monitor.server.repositories.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MaintenanceServiceTest {

    @Mock
    private MaintenanceScheduleRepository scheduleRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private MaintenanceService maintenanceService;

    private Vehicle testVehicle;
    private MaintenanceSchedule testSchedule;

    @BeforeEach
    void setUp() {
        testVehicle = Vehicle.builder()
                .id(1L)
                .odometerReading(15000.0) // We will adjust this per test
                .build();

        testSchedule = MaintenanceSchedule.builder()
                .id(1L)
                .vehicle(testVehicle)
                .status(ScheduleStatus.PENDING)
                .nextServiceDueKM(15000.0)
                .build();
    }

    // --- Tests for evaluateMaintenanceStatus ---

    @Test
    void evaluateMaintenanceStatus_ThrowsException_WhenVehicleNotFound() {
        when(vehicleRepository.findById(99L)).thenReturn(Optional.empty());

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () ->
                maintenanceService.evaluateMaintenanceStatus(99L));
        assertEquals("Vehicle not found", ex.getMessage());
    }

    @Test
    void evaluateMaintenanceStatus_DoesNothing_WhenNoActiveSchedule() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        when(scheduleRepository.findTopByVehicleIdOrderByNextServiceDueKMDesc(1L))
                .thenReturn(Optional.empty());

        // Should execute cleanly without saving anything
        maintenanceService.evaluateMaintenanceStatus(1L);

        verify(scheduleRepository, never()).save(any());
    }

    @Test
    void evaluateMaintenanceStatus_DoesNothing_WhenScheduleNotPending() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));

        // Change status to COMPLETED so it fails the `status == PENDING` check
        testSchedule.setStatus(ScheduleStatus.COMPLETED);
        when(scheduleRepository.findTopByVehicleIdOrderByNextServiceDueKMDesc(1L))
                .thenReturn(Optional.of(testSchedule));

        maintenanceService.evaluateMaintenanceStatus(1L);

        verify(scheduleRepository, never()).save(any());
    }

    @Test
    void evaluateMaintenanceStatus_DoesNothing_WhenUnderThreshold() {
        // Vehicle is at 15,499. Due is 15,000 + 500 = 15,500. Threshold NOT met.
        testVehicle.setOdometerReading(15499.0);

        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        when(scheduleRepository.findTopByVehicleIdOrderByNextServiceDueKMDesc(1L))
                .thenReturn(Optional.of(testSchedule));

        maintenanceService.evaluateMaintenanceStatus(1L);

        assertEquals(ScheduleStatus.PENDING, testSchedule.getStatus());
        verify(scheduleRepository, never()).save(any());
    }

    @Test
    void evaluateMaintenanceStatus_MarksOverdue_When500KmPastDue() {
        // Vehicle is at 15,500. Due is 15,000 + 500 = 15,500. Threshold EXACTLY met.
        testVehicle.setOdometerReading(15500.0);

        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        when(scheduleRepository.findTopByVehicleIdOrderByNextServiceDueKMDesc(1L))
                .thenReturn(Optional.of(testSchedule));

        maintenanceService.evaluateMaintenanceStatus(1L);

        assertEquals(ScheduleStatus.OVERDUE, testSchedule.getStatus());
        verify(scheduleRepository, times(1)).save(testSchedule);
    }

    // --- Tests for createPreventiveSchedule ---

    @Test
    void createPreventiveSchedule_ThrowsException_WhenVehicleNotFound() {
        when(vehicleRepository.findById(99L)).thenReturn(Optional.empty());

        BusinessRuleException ex = assertThrows(BusinessRuleException.class, () ->
                maintenanceService.createPreventiveSchedule(99L, 10000.0));
        assertEquals("Vehicle not found", ex.getMessage());
    }

    @Test
    void createPreventiveSchedule_Success() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        when(scheduleRepository.save(any(MaintenanceSchedule.class))).thenAnswer(i -> i.getArguments()[0]);

        double currentOdometer = 12000.0;
        MaintenanceSchedule newSchedule = maintenanceService.createPreventiveSchedule(1L, currentOdometer);

        assertNotNull(newSchedule);
        assertEquals(ScheduleType.PREVENTIVE, newSchedule.getScheduleType());
        assertEquals(5000.0, newSchedule.getServiceIntervalKM());
        assertEquals(12000.0, newSchedule.getLastServiceKM());
        assertEquals(17000.0, newSchedule.getNextServiceDueKM()); // 12000 + 5000
        assertEquals(ScheduleStatus.PENDING, newSchedule.getStatus());

        verify(scheduleRepository, times(1)).save(any(MaintenanceSchedule.class));
    }
}