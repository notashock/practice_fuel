package com.fuel_monitor.server.dtos.response;

import com.fuel_monitor.server.models.entities.Vehicle;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {
    private Long id;
    private String registrationNumber;
    private String vehicleType;
    private String make;
    private String model;
    private Integer yearOfManufacture;
    private String fuelType;
    private Double odometerReading;
    private Double totalValue;
    private String status;

    public static VehicleResponse fromEntity(Vehicle vehicle) {
        if (vehicle == null) return null;
        return VehicleResponse.builder()
                .id(vehicle.getId())
                .registrationNumber(vehicle.getRegistrationNumber())
                .vehicleType(vehicle.getVehicleType().name())
                .make(vehicle.getMake().name())
                .model(vehicle.getModel())
                .yearOfManufacture(vehicle.getYearOfManufacture())
                .fuelType(vehicle.getFuelType().name())
                .odometerReading(vehicle.getOdometerReading())
                .totalValue(vehicle.getTotalValue())
                .status(vehicle.getStatus().name())
                .build();
    }
}
