package com.fuel_monitor.server.models.entities;

import com.fuel_monitor.server.models.enums.ScheduleStatus;
import com.fuel_monitor.server.models.enums.ScheduleType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "maintenance_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScheduleType scheduleType;

    @Column(nullable = false)
    private Double serviceIntervalKM = 5000.0; // Default preventive interval [cite: 71]

    @Column(nullable = false)
    private Double lastServiceKM;

    @Column(nullable = false)
    private Double nextServiceDueKM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScheduleStatus status = ScheduleStatus.PENDING;
}