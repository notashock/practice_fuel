package com.fuel_monitor.server.dtos.response;

import com.fuel_monitor.server.models.entities.FuelLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FuelLogResponse {
    private Long id;
    private Long vehicleId;
    private String vehicleRegistrationNumber;
    private Long driverId;
    private String driverName;
    private Double fuelAmountLiters;
    private Double fuelCost;
    private Double odometerAtRefill;
    private String fuelType;
    private LocalDateTime refillDate;
    private String receiptUrl;

    public static FuelLogResponse fromEntity(FuelLog log) {
        if (log == null) return null;
        return FuelLogResponse.builder()
                .id(log.getId())
                .vehicleId(log.getVehicle() != null ? log.getVehicle().getId() : null)
                .vehicleRegistrationNumber(log.getVehicle() != null ? log.getVehicle().getRegistrationNumber() : null)
                .driverId(log.getDriver() != null ? log.getDriver().getId() : null)
                .driverName(log.getDriver() != null ? log.getDriver().getName() : null)
                .fuelAmountLiters(log.getFuelAmountLiters())
                .fuelCost(log.getFuelCost())
                .odometerAtRefill(log.getOdometerAtRefill())
                .fuelType(log.getFuelType() != null ? log.getFuelType().name() : null)
                .refillDate(log.getRefillDate())
                .receiptUrl(log.getReceiptUrl())
                .build();
    }
}
