package com.fuel_monitor.server.controllers;

import com.fuel_monitor.server.dtos.request.VehicleCostRequest;
import com.fuel_monitor.server.dtos.response.VehicleCostResponse;
import com.fuel_monitor.server.exceptions.BusinessRuleException;
import com.fuel_monitor.server.models.entities.Vehicle;
import com.fuel_monitor.server.models.entities.VehicleCost;
import com.fuel_monitor.server.repositories.VehicleCostRepository;
import com.fuel_monitor.server.repositories.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/costs")
@RequiredArgsConstructor
public class CostController {

    private final VehicleCostRepository costRepository;
    private final VehicleRepository vehicleRepository;

    @PostMapping("/record")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<VehicleCostResponse> recordCost(@RequestBody VehicleCostRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new BusinessRuleException("Vehicle not found"));

        VehicleCost cost = VehicleCost.builder()
                .vehicle(vehicle)
                .costType(request.getCostType())
                .amount(request.getAmount())
                .remarks(request.getRemarks())
                .build();

        VehicleCost saved = costRepository.save(cost);
        return ResponseEntity.ok(VehicleCostResponse.fromEntity(saved));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN')")
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

    @GetMapping("/vehicle/{vehicleId}")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN')")
    public ResponseEntity<List<VehicleCostResponse>> getVehicleCosts(@PathVariable Long vehicleId) {
        List<VehicleCostResponse> responses = costRepository.findByVehicleId(vehicleId).stream()
                .map(VehicleCostResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
}