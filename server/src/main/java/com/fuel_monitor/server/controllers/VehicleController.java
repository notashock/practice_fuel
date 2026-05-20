package com.fuel_monitor.server.controllers;

import com.fuel_monitor.server.dtos.request.VehicleRequest;
import com.fuel_monitor.server.dtos.response.VehicleResponse;
import com.fuel_monitor.server.exceptions.BusinessRuleException;
import com.fuel_monitor.server.models.entities.Vehicle;
import com.fuel_monitor.server.models.enums.VehicleStatus;
import com.fuel_monitor.server.repositories.VehicleRepository;
import com.fuel_monitor.server.services.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleRepository vehicleRepository;
    private final MaintenanceService maintenanceService;

    @PostMapping
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<VehicleResponse> registerVehicle(@RequestBody VehicleRequest request) {
        // Simple regex matching registration rule: XX00XX0000
        if (request.getRegistrationNumber() == null || !request.getRegistrationNumber().matches("^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$")) {
            throw new BusinessRuleException("Registration number format must be XX00XX0000 (e.g., KA01AB1234)");
        }

        if (request.getTotalValue() == null || request.getTotalValue() <= 0) {
            throw new BusinessRuleException("Vehicle total value must be valid and positive");
        }

        Vehicle vehicle = Vehicle.builder()
                .registrationNumber(request.getRegistrationNumber())
                .vehicleType(request.getVehicleType())
                .make(request.getMake())
                .model(request.getModel())
                .yearOfManufacture(request.getYearOfManufacture())
                .fuelType(request.getFuelType())
                .odometerReading(request.getOdometerReading())
                .totalValue(request.getTotalValue())
                .status(VehicleStatus.ACTIVE)
                .build();

        Vehicle saved = vehicleRepository.save(vehicle);
        return ResponseEntity.ok(VehicleResponse.fromEntity(saved));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN', 'MECHANIC', 'DRIVER')")
    public ResponseEntity<List<VehicleResponse>> getAllVehicles() {
        List<VehicleResponse> responses = vehicleRepository.findAll().stream()
                .map(VehicleResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN', 'MECHANIC', 'DRIVER')")
    public ResponseEntity<VehicleResponse> getVehicleById(@PathVariable Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new BusinessRuleException("Vehicle not found"));
        return ResponseEntity.ok(VehicleResponse.fromEntity(vehicle));
    }

    @PutMapping("/{id}/odometer")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<VehicleResponse> updateOdometer(@PathVariable Long id, @RequestParam Double reading) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new BusinessRuleException("Vehicle not found"));

        if (reading == null || reading <= vehicle.getOdometerReading()) {
            throw new BusinessRuleException("Odometer reading must be strictly increasing");
        }

        vehicle.setOdometerReading(reading);
        Vehicle saved = vehicleRepository.save(vehicle);

        // Trigger active maintenance overdue check
        maintenanceService.evaluateMaintenanceStatus(id);

        return ResponseEntity.ok(VehicleResponse.fromEntity(saved));
    }

    @PutMapping("/{id}/retire")
    @PreAuthorize("hasRole('FLEET_MANAGER')")
    public ResponseEntity<VehicleResponse> retireVehicle(@PathVariable Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new BusinessRuleException("Vehicle not found"));

        vehicle.setStatus(VehicleStatus.RETIRED);
        Vehicle saved = vehicleRepository.save(vehicle);
        return ResponseEntity.ok(VehicleResponse.fromEntity(saved));
    }
}