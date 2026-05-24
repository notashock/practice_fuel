package com.fuel_monitor.server.controllers;

import com.fuel_monitor.server.dtos.request.VehicleCostRequest;
import com.fuel_monitor.server.exceptions.BusinessRuleException;
import com.fuel_monitor.server.models.entities.Vehicle;
import com.fuel_monitor.server.models.entities.VehicleCost;
import com.fuel_monitor.server.repositories.VehicleCostRepository;
import com.fuel_monitor.server.repositories.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/costs")
@RequiredArgsConstructor
public class CostController {

    private final VehicleCostRepository costRepository;
    private final VehicleRepository vehicleRepository;

    @PostMapping("/record")
    public ResponseEntity<VehicleCost> recordCost(@RequestBody VehicleCostRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new BusinessRuleException("Vehicle not found"));

        VehicleCost cost = VehicleCost.builder()
                .vehicle(vehicle)
                .costType(request.getCostType())
                .amount(request.getAmount())
                .remarks(request.getRemarks())
                .build();

        return ResponseEntity.ok(costRepository.save(cost));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getCostSummary(
            @RequestParam Long vehicleId,
            @RequestParam int year
    ) {
        // We explicitly pass the MAINTENANCE enum to the query now
        Double totalMaintenanceCost = costRepository.getTotalCostByVehicleAndTypeAndYear(
                vehicleId,
                com.fuel_monitor.server.models.enums.CostType.MAINTENANCE,
                year
        );

        Map<String, Object> summary = new HashMap<>();
        summary.put("vehicleId", vehicleId);
        summary.put("year", year);
        summary.put("totalMaintenanceCost", totalMaintenanceCost != null ? totalMaintenanceCost : 0.0);

        return ResponseEntity.ok(summary);
    }
}