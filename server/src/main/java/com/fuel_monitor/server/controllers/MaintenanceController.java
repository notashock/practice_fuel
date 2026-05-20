package com.fuel_monitor.server.controllers;

import com.fuel_monitor.server.dtos.request.MaintenanceRecordRequest;
import com.fuel_monitor.server.dtos.response.MaintenanceRecordResponse;
import com.fuel_monitor.server.dtos.response.MaintenanceScheduleResponse;
import com.fuel_monitor.server.exceptions.BusinessRuleException;
import com.fuel_monitor.server.models.entities.*;
import com.fuel_monitor.server.models.enums.CostType;
import com.fuel_monitor.server.models.enums.ScheduleStatus;
import com.fuel_monitor.server.models.enums.VehicleStatus;
import com.fuel_monitor.server.repositories.MaintenanceRecordRepository;
import com.fuel_monitor.server.repositories.MaintenanceScheduleRepository;
import com.fuel_monitor.server.repositories.VehicleCostRepository;
import com.fuel_monitor.server.repositories.VehicleRepository;
import com.fuel_monitor.server.services.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceScheduleRepository scheduleRepository;
    private final MaintenanceRecordRepository recordRepository;
    private final VehicleRepository vehicleRepository;
    private final VehicleCostRepository costRepository;
    private final MaintenanceService maintenanceService;

    @PostMapping("/schedule")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<MaintenanceScheduleResponse> scheduleMaintenance(@RequestParam Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new BusinessRuleException("Vehicle not found"));

        if (vehicle.getStatus() == VehicleStatus.RETIRED) {
            throw new BusinessRuleException("RETIRED vehicles cannot be scheduled for maintenance.");
        }

        // Triggers the logic built in Phase 4
        MaintenanceSchedule schedule = maintenanceService.createPreventiveSchedule(vehicleId, vehicle.getOdometerReading());

        vehicle.setStatus(VehicleStatus.UNDER_MAINTENANCE); // Vehicle cannot be ACTIVE if UNDER_MAINTENANCE
        vehicleRepository.save(vehicle);

        return ResponseEntity.ok(MaintenanceScheduleResponse.fromEntity(schedule));
    }

    @PostMapping("/records")
    @PreAuthorize("hasRole('MECHANIC')")
    public ResponseEntity<MaintenanceRecordResponse> recordMaintenance(
            @RequestParam Long vehicleId,
            @RequestBody MaintenanceRecordRequest request,
            @AuthenticationPrincipal User mechanic
    ) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new BusinessRuleException("Vehicle not found"));

        if (vehicle.getStatus() == VehicleStatus.RETIRED) {
            throw new BusinessRuleException("Maintenance records cannot be logged for RETIRED vehicles.");
        }

        if (request.getCost() == null) {
            throw new BusinessRuleException("Maintenance cost is required.");
        }

        if (request.getCost() < 70) {
            throw new BusinessRuleException("Maintenance cost must be >= 70");
        }

        if (request.getCost() > vehicle.getTotalValue()) {
            throw new BusinessRuleException("Maintenance cost (₹" + request.getCost() + ") cannot exceed the vehicle's total value (₹" + vehicle.getTotalValue() + ")");
        }

        // 1. Save the actual maintenance record
        MaintenanceRecord record = MaintenanceRecord.builder()
                .vehicle(vehicle)
                .mechanic(mechanic)
                .serviceType(request.getServiceType())
                .cost(request.getCost())
                .partsReplaced(request.getPartsReplaced())
                .remarks(request.getRemarks())
                .build();

        MaintenanceRecord savedRecord = recordRepository.save(record);

        // 2. AUTO-GENERATE the VehicleCost ledger entry
        VehicleCost autoCost = VehicleCost.builder()
                .vehicle(vehicle)
                .costType(CostType.MAINTENANCE)
                .amount(request.getCost())
                .remarks("Auto-generated from Maintenance Record for: " + request.getServiceType().name())
                .build();

        costRepository.save(autoCost);

        return ResponseEntity.ok(MaintenanceRecordResponse.fromEntity(savedRecord));
    }

    @PutMapping("/schedule/{id}/complete")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<MaintenanceScheduleResponse> completeMaintenance(@PathVariable Long id) {
        MaintenanceSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new BusinessRuleException("Schedule not found"));

        schedule.setStatus(ScheduleStatus.COMPLETED);

        Vehicle vehicle = schedule.getVehicle();
        
        // Prevent reactivating retired vehicles
        if (vehicle.getStatus() != VehicleStatus.RETIRED) {
            vehicle.setStatus(VehicleStatus.ACTIVE);
        }
        vehicleRepository.save(vehicle);

        MaintenanceSchedule saved = scheduleRepository.save(schedule);
        return ResponseEntity.ok(MaintenanceScheduleResponse.fromEntity(saved));
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN', 'MECHANIC')")
    public ResponseEntity<List<MaintenanceScheduleResponse>> getOverdueMaintenance() {
        List<MaintenanceScheduleResponse> responses = scheduleRepository.findByStatus(ScheduleStatus.OVERDUE).stream()
                .map(MaintenanceScheduleResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/vehicle/{vehicleId}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN', 'MECHANIC')")
    public ResponseEntity<List<MaintenanceRecordResponse>> getVehicleMaintenance(@PathVariable Long vehicleId) {
        List<MaintenanceRecordResponse> responses = recordRepository.findByVehicleId(vehicleId).stream()
                .map(MaintenanceRecordResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
}