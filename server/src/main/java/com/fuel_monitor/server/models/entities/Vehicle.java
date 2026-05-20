package com.fuel_monitor.server.models.entities;

import com.fuel_monitor.server.models.enums.FuelType;
import com.fuel_monitor.server.models.enums.Make;
import com.fuel_monitor.server.models.enums.VehicleStatus;
import com.fuel_monitor.server.models.enums.VehicleType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String registrationNumber; // Required for XX00XX0000 format validation

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType vehicleType; // TRUCK, BUS, VAN, CAR

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Make make; // TATA, ASHOK_LEYLAND, VOLVO, MARUTI

    @Column(nullable = false)
    private String model;

    @Column(nullable = false)
    private Integer yearOfManufacture;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FuelType fuelType; // DIESEL, PETROL, CNG, EV

    @Column(nullable = false)
    private Double odometerReading;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleStatus status = VehicleStatus.ACTIVE; // Default lifecycle starts at ACTIVE
}