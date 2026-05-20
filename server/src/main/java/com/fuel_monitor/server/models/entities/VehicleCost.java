package com.fuel_monitor.server.models.entities;

import com.fuel_monitor.server.models.enums.CostType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "vehicle_costs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleCost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CostType costType;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private LocalDateTime recordedAt;

    private String remarks;

    @PrePersist
    protected void onCreate() {
        if (recordedAt == null) {
            recordedAt = LocalDateTime.now();
        }
    }
}