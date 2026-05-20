package com.fuel_monitor.server.dtos.request;

import com.fuel_monitor.server.models.enums.ServiceType;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceRecordRequest {
    private Long vehicleId;
    private ServiceType serviceType;
    private Double cost;
    private String partsReplaced;
    private String remarks;
}