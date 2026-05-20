package com.fuel_monitor.server.dtos.request;

import com.fuel_monitor.server.models.enums.FuelType;
import com.fuel_monitor.server.models.enums.Make;
import com.fuel_monitor.server.models.enums.VehicleType;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleRequest {
    private String registrationNumber; // Must follow XX00XX0000 format validation later
    private VehicleType vehicleType;
    private Make make;
    private String model;
    private Integer yearOfManufacture;
    private FuelType fuelType;
    private Double odometerReading;
}