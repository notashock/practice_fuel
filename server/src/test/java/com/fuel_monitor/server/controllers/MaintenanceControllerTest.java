package com.fuel_monitor.server.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fuel_monitor.server.dtos.request.MaintenanceRecordRequest;
import com.fuel_monitor.server.exceptions.GlobalExceptionHandler;
import com.fuel_monitor.server.models.entities.*;
import com.fuel_monitor.server.models.enums.Role;
import com.fuel_monitor.server.models.enums.ScheduleStatus;
import com.fuel_monitor.server.models.enums.ServiceType; // Assuming you have this enum
import com.fuel_monitor.server.models.enums.VehicleStatus;
import com.fuel_monitor.server.repositories.MaintenanceRecordRepository;
import com.fuel_monitor.server.repositories.MaintenanceScheduleRepository;
import com.fuel_monitor.server.repositories.VehicleCostRepository;
import com.fuel_monitor.server.repositories.VehicleRepository;
import com.fuel_monitor.server.services.MaintenanceService;
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
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class MaintenanceControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock private MaintenanceScheduleRepository scheduleRepository;
    @Mock private MaintenanceRecordRepository recordRepository;
    @Mock private VehicleRepository vehicleRepository;
    @Mock private VehicleCostRepository costRepository;
    @Mock private MaintenanceService maintenanceService;

    @InjectMocks
    private MaintenanceController maintenanceController;

    private Vehicle testVehicle;
    private MaintenanceSchedule testSchedule;
    private MaintenanceRecordRequest validRecordRequest;
    private User testMechanic;

    @BeforeEach
    void setUp() {
        testMechanic = User.builder().id(99L).email("mechanic@fleet.com").role(Role.MECHANIC).build();

        // Standalone setup with a custom resolver to mock the @AuthenticationPrincipal
        mockMvc = MockMvcBuilders.standaloneSetup(maintenanceController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(new HandlerMethodArgumentResolver() {
                    @Override
                    public boolean supportsParameter(MethodParameter parameter) {
                        return parameter.getParameterType().isAssignableFrom(User.class);
                    }
                    @Override
                    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer, NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                        return testMechanic; // Injects our fake mechanic whenever @AuthenticationPrincipal is used!
                    }
                })
                .build();

        testVehicle = Vehicle.builder()
                .id(1L)
                .odometerReading(10000.0)
                .status(VehicleStatus.ACTIVE)
                .build();

        testSchedule = MaintenanceSchedule.builder()
                .id(1L)
                .vehicle(testVehicle)
                .status(ScheduleStatus.PENDING)
                .build();

        // Assuming ServiceType.OIL_CHANGE exists in your enums. Change if necessary!
        validRecordRequest = MaintenanceRecordRequest.builder()
                .serviceType(ServiceType.OIL_CHANGE)
                .cost(150.0)
                .partsReplaced("Oil Filter")
                .remarks("Standard service")
                .build();
    }

    @Test
    void scheduleMaintenance_Returns200_AndSetsVehicleToUnderMaintenance() throws Exception {
        Mockito.when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        Mockito.when(maintenanceService.createPreventiveSchedule(1L, 10000.0)).thenReturn(testSchedule);
        Mockito.when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(i -> i.getArguments()[0]);

        mockMvc.perform(post("/api/maintenance/schedule")
                        .param("vehicleId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"));

        // Verifies the vehicle status was updated
        Mockito.verify(vehicleRepository, Mockito.times(1)).save(Mockito.argThat(v -> v.getStatus() == VehicleStatus.UNDER_MAINTENANCE));
    }

    @Test
    void scheduleMaintenance_Returns400_WhenVehicleNotFound() throws Exception {
        Mockito.when(vehicleRepository.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/maintenance/schedule")
                        .param("vehicleId", "99"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Vehicle not found"));
    }

    @Test
    void recordMaintenance_Returns200_AndGeneratesAutoCost() throws Exception {
        Mockito.when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        Mockito.when(recordRepository.save(any(MaintenanceRecord.class))).thenAnswer(i -> i.getArguments()[0]);
        Mockito.when(costRepository.save(any(VehicleCost.class))).thenAnswer(i -> i.getArguments()[0]);

        mockMvc.perform(post("/api/maintenance/records")
                        .param("vehicleId", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRecordRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cost").value(150.0))
                .andExpect(jsonPath("$.partsReplaced").value("Oil Filter"));

        // Verifies the ledger entry was automatically generated
        Mockito.verify(costRepository, Mockito.times(1)).save(any(VehicleCost.class));
    }

    @Test
    void recordMaintenance_Returns400_WhenCostIsTooLow() throws Exception {
        Mockito.when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));

        validRecordRequest.setCost(50.0); // Below the 70 threshold

        mockMvc.perform(post("/api/maintenance/records")
                        .param("vehicleId", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRecordRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Maintenance cost must be >= 70"));

        // Ensures nothing was saved to the DB
        Mockito.verify(recordRepository, Mockito.never()).save(any());
        Mockito.verify(costRepository, Mockito.never()).save(any());
    }

    @Test
    void completeMaintenance_Returns200_AndSetsVehicleToActive() throws Exception {
        testSchedule.getVehicle().setStatus(VehicleStatus.UNDER_MAINTENANCE);

        Mockito.when(scheduleRepository.findById(1L)).thenReturn(Optional.of(testSchedule));
        Mockito.when(scheduleRepository.save(any(MaintenanceSchedule.class))).thenAnswer(i -> i.getArguments()[0]);

        mockMvc.perform(put("/api/maintenance/schedule/1/complete"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        // Verify vehicle is active again
        Mockito.verify(vehicleRepository, Mockito.times(1)).save(Mockito.argThat(v -> v.getStatus() == VehicleStatus.ACTIVE));
    }

    @Test
    void getOverdueMaintenance_ReturnsList() throws Exception {
        testSchedule.setStatus(ScheduleStatus.OVERDUE);
        Mockito.when(scheduleRepository.findByStatus(ScheduleStatus.OVERDUE)).thenReturn(Arrays.asList(testSchedule));

        mockMvc.perform(get("/api/maintenance/overdue"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].status").value("OVERDUE"));
    }

    @Test
    void getVehicleMaintenance_ReturnsList() throws Exception {
        MaintenanceRecord record = MaintenanceRecord.builder().cost(200.0).build();
        Mockito.when(recordRepository.findByVehicleId(1L)).thenReturn(Arrays.asList(record));

        mockMvc.perform(get("/api/maintenance/vehicle/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].cost").value(200.0));
    }
}