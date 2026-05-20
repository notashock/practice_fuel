package com.fuel_monitor.server.dtos.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fuel_monitor.server.models.enums.ServiceType;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceRecordRequest {
    private Long vehicleId;
    @JsonProperty("maintenanceType")
    private ServiceType serviceType;
    @JsonProperty("maintenanceCost")
    private Double cost;
    private String partsReplaced;
    @JsonProperty("description")
    private String remarks;
}