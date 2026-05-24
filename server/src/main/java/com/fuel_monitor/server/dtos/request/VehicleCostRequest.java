package com.fuel_monitor.server.dtos.request;

import com.fuel_monitor.server.models.enums.CostType;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleCostRequest {
    private Long vehicleId;
    private CostType costType;
    private Double amount;
    private String remarks;
}