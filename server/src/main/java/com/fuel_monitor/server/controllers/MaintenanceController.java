package com.fuel_monitor.server.controllers;

import com.fuel_monitor.server.dtos.request.MaintenanceRecordRequest;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<MaintenanceSchedule> scheduleMaintenance(@RequestParam Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new BusinessRuleException("Vehicle not found"));

        // Triggers the logic built in Phase 4
        MaintenanceSchedule schedule = maintenanceService.createPreventiveSchedule(vehicleId, vehicle.getOdometerReading());

        vehicle.setStatus(VehicleStatus.UNDER_MAINTENANCE); // Vehicle cannot be ACTIVE if UNDER_MAINTENANCE
        vehicleRepository.save(vehicle);

        return ResponseEntity.ok(schedule);
    }

    @PostMapping("/records")
    public ResponseEntity<MaintenanceRecord> recordMaintenance(
            @RequestParam Long vehicleId, // <-- Extracted from the query string
            @RequestBody MaintenanceRecordRequest request,
            @AuthenticationPrincipal User mechanic
    ) {
        // Uses the URL parameter instead of the request body
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new BusinessRuleException("Vehicle not found"));

        if (request.getCost() < 70) {
            throw new BusinessRuleException("Maintenance cost must be >= 70");
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

        return ResponseEntity.ok(savedRecord);
    }

    @PutMapping("/schedule/{id}/complete")
    public ResponseEntity<MaintenanceSchedule> completeMaintenance(@PathVariable Long id) {
        MaintenanceSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new BusinessRuleException("Schedule not found"));

        schedule.setStatus(ScheduleStatus.COMPLETED);

        Vehicle vehicle = schedule.getVehicle();
        vehicle.setStatus(VehicleStatus.ACTIVE);
        vehicleRepository.save(vehicle);

        return ResponseEntity.ok(scheduleRepository.save(schedule));
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<MaintenanceSchedule>> getOverdueMaintenance() {
        return ResponseEntity.ok(scheduleRepository.findByStatus(ScheduleStatus.OVERDUE));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<MaintenanceRecord>> getVehicleMaintenance(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(recordRepository.findByVehicleId(vehicleId));
    }
}