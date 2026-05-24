package com.fuel_monitor.server.controllers;

import com.fuel_monitor.server.dtos.request.FuelLogRequest;
import com.fuel_monitor.server.models.entities.FuelLog;
import com.fuel_monitor.server.models.entities.User;
import com.fuel_monitor.server.models.entities.VehicleCost;
import com.fuel_monitor.server.models.enums.CostType;
import com.fuel_monitor.server.repositories.FuelLogRepository;
import com.fuel_monitor.server.repositories.VehicleCostRepository;
import com.fuel_monitor.server.services.FuelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fuel-logs")
@RequiredArgsConstructor
public class FuelController {

    private final FuelService fuelService;
    private final FuelLogRepository fuelLogRepository;
    private final VehicleCostRepository costRepository; // Injected for auto-cost generation

    @PostMapping("/vehicle/{vehicleId}")
    public ResponseEntity<FuelLog> logFuel(
            @PathVariable Long vehicleId,
            @AuthenticationPrincipal User driver, // Automatically pulls the logged-in driver context via JWT
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
                .vehicle(savedLog.getVehicle()) // We use the vehicle entity attached to the saved log
                .costType(CostType.FUEL)
                .amount(request.getFuelCost())
                .remarks("Auto-generated from Fuel Log by Driver ID: " + driver.getId())
                .build();

        costRepository.save(autoCost);

        return ResponseEntity.ok(savedLog);
    }

    // THE MISSING GET ENDPOINT
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<FuelLog>> getFuelLogsByVehicle(@PathVariable Long vehicleId) {
        // Utilizes the custom finder method we created in Phase 3 to return newest logs first
        return ResponseEntity.ok(fuelLogRepository.findByVehicleIdOrderByRefillDateDesc(vehicleId));
    }
}