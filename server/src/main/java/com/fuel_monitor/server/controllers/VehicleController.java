package com.fuel_monitor.server.controllers;

import com.fuel_monitor.server.dtos.request.VehicleRequest;
import com.fuel_monitor.server.exceptions.BusinessRuleException;
import com.fuel_monitor.server.models.entities.Vehicle;
import com.fuel_monitor.server.models.enums.VehicleStatus;
import com.fuel_monitor.server.repositories.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleRepository vehicleRepository;

    @PostMapping
    public ResponseEntity<Vehicle> registerVehicle(@RequestBody VehicleRequest request) {
        // Simple regex matching registration rule: XX00XX0000
        if (!request.getRegistrationNumber().matches("^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$")) {
            throw new BusinessRuleException("Registration number format must be XX00XX0000 (e.g., KA01AB1234)");
        }

        Vehicle vehicle = Vehicle.builder()
                .registrationNumber(request.getRegistrationNumber())
                .vehicleType(request.getVehicleType())
                .make(request.getMake())
                .model(request.getModel())
                .yearOfManufacture(request.getYearOfManufacture())
                .fuelType(request.getFuelType())
                .odometerReading(request.getOdometerReading())
                .status(VehicleStatus.ACTIVE)
                .build();

        return ResponseEntity.ok(vehicleRepository.save(vehicle));
    }

    @GetMapping
    public ResponseEntity<List<Vehicle>> getAllVehicles() {
        return ResponseEntity.ok(vehicleRepository.findAll());
    }

    @PutMapping("/{id}/odometer")
    public ResponseEntity<Vehicle> updateOdometer(@PathVariable Long id, @RequestParam Double reading) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new BusinessRuleException("Vehicle not found"));

        if (reading < vehicle.getOdometerReading()) {
            throw new BusinessRuleException("Odometer reading must be greater than or equal to the previous reading");
        }

        vehicle.setOdometerReading(reading);
        return ResponseEntity.ok(vehicleRepository.save(vehicle));
    }

    @PutMapping("/{id}/retire")
    public ResponseEntity<Vehicle> retireVehicle(@PathVariable Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new BusinessRuleException("Vehicle not found"));

        vehicle.setStatus(VehicleStatus.RETIRED);
        return ResponseEntity.ok(vehicleRepository.save(vehicle));
    }
}