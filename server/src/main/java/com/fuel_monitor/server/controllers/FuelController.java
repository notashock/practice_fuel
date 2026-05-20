package com.fuel_monitor.server.controllers;

import com.fuel_monitor.server.dtos.request.FuelLogRequest;
import com.fuel_monitor.server.models.entities.FuelLog;
import com.fuel_monitor.server.models.entities.User;
import com.fuel_monitor.server.services.FuelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fuel-logs")
@RequiredArgsConstructor
public class FuelController {

    private final FuelService fuelService;

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

        FuelLog savedLog = fuelService.logFuel(vehicleId, driver.getId(), fuelLog);
        return ResponseEntity.ok(savedLog);
    }
}