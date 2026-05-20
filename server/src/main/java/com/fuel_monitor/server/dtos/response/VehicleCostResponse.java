package com.fuel_monitor.server.dtos.response;

import com.fuel_monitor.server.models.entities.VehicleCost;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleCostResponse {
    private Long id;
    private Long vehicleId;
    private String vehicleRegistrationNumber;
    private String costType;
    private Double amount;
    private LocalDateTime recordedAt;
    private String remarks;

    public static VehicleCostResponse fromEntity(VehicleCost cost) {
        if (cost == null) return null;
        return VehicleCostResponse.builder()
                .id(cost.getId())
                .vehicleId(cost.getVehicle() != null ? cost.getVehicle().getId() : null)
                .vehicleRegistrationNumber(cost.getVehicle() != null ? cost.getVehicle().getRegistrationNumber() : null)
                .costType(cost.getCostType() != null ? cost.getCostType().name() : null)
                .amount(cost.getAmount())
                .recordedAt(cost.getRecordedAt())
                .remarks(cost.getRemarks())
                .build();
    }
}
