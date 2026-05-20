package com.fuel_monitor.server.controllers;

import com.fuel_monitor.server.dtos.request.FuelLogRequest;
import com.fuel_monitor.server.dtos.response.FuelLogResponse;
import com.fuel_monitor.server.models.entities.FuelLog;
import com.fuel_monitor.server.models.entities.User;
import com.fuel_monitor.server.models.entities.VehicleCost;
import com.fuel_monitor.server.models.enums.CostType;
import com.fuel_monitor.server.repositories.FuelLogRepository;
import com.fuel_monitor.server.repositories.VehicleCostRepository;
import com.fuel_monitor.server.services.FuelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/fuel-logs")
@RequiredArgsConstructor
public class FuelController {

    private final FuelService fuelService;
    private final FuelLogRepository fuelLogRepository;
    private final VehicleCostRepository costRepository;

    @PostMapping("/vehicle/{vehicleId}")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<FuelLogResponse> logFuel(
            @PathVariable Long vehicleId,
            @AuthenticationPrincipal User driver,
            @RequestBody FuelLogRequest request
    ) {
        FuelLog fuelLog = FuelLog.builder()
                .fuelAmountLiters(request.getFuelAmountLiters())
                .fuelCost(request.getFuelCost())
                .odometerAtRefill(request.getOdometerAtRefill())
                .fuelType(request.getFuelType())
                .receiptUrl(request.getReceiptUrl())
                .build();

        // 1. Save the actual fuel log (this triggers the efficiency business logic)
        FuelLog savedLog = fuelService.logFuel(vehicleId, driver.getId(), fuelLog);

        // 2. AUTO-GENERATE the VehicleCost ledger entry so it appears in Admin financial reports
        VehicleCost autoCost = VehicleCost.builder()
                .vehicle(savedLog.getVehicle())
                .costType(CostType.FUEL)
                .amount(request.getFuelCost())
                .remarks("Auto-generated from Fuel Log by Driver ID: " + driver.getId())
                .build();

        costRepository.save(autoCost);

        return ResponseEntity.ok(FuelLogResponse.fromEntity(savedLog));
    }

    @GetMapping("/vehicle/{vehicleId}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN', 'DRIVER')")
    public ResponseEntity<List<FuelLogResponse>> getFuelLogsByVehicle(@PathVariable Long vehicleId) {
        List<FuelLogResponse> responses = fuelLogRepository.findByVehicleIdOrderByRefillDateDesc(vehicleId).stream()
                .map(FuelLogResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
}