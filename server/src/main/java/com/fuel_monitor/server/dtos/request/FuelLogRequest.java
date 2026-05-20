package com.fuel_monitor.server.dtos.request;

import com.fuel_monitor.server.models.enums.FuelType;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FuelLogRequest {
    private Double fuelAmountLiters;
    private Double fuelCost;
    private Double odometerAtRefill;
    private FuelType fuelType;
    private String receiptUrl;
}