package com.fuel_monitor.server.models.entities;

import com.fuel_monitor.server.models.enums.FuelType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "fuel_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FuelLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Foreign Key: Links to the Vehicle
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    // Foreign Key: Links to the User (Must be a DRIVER)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private User driver;

    @Column(nullable = false)
    private Double fuelAmountLiters;

    @Column(nullable = false)
    private Double fuelCost;

    @Column(nullable = false)
    private Double odometerAtRefill;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FuelType fuelType;

    @Column(nullable = false)
    private LocalDateTime refillDate;

    private String receiptUrl;

    @PrePersist
    protected void onCreate() {
        if (refillDate == null) {
            refillDate = LocalDateTime.now();
        }
    }
}