package com.fuel_monitor.server.dtos.response;

import com.fuel_monitor.server.models.entities.MaintenanceRecord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceRecordResponse {
    private Long id;
    private Long vehicleId;
    private String vehicleRegistrationNumber;
    private Long mechanicId;
    private String mechanicName;
    private String serviceType;
    private Double cost;
    private String partsReplaced;
    private String remarks;

    public static MaintenanceRecordResponse fromEntity(MaintenanceRecord record) {
        if (record == null) return null;
        return MaintenanceRecordResponse.builder()
                .id(record.getId())
                .vehicleId(record.getVehicle() != null ? record.getVehicle().getId() : null)
                .vehicleRegistrationNumber(record.getVehicle() != null ? record.getVehicle().getRegistrationNumber() : null)
                .mechanicId(record.getMechanic() != null ? record.getMechanic().getId() : null)
                .mechanicName(record.getMechanic() != null ? record.getMechanic().getName() : null)
                .serviceType(record.getServiceType() != null ? record.getServiceType().name() : null)
                .cost(record.getCost())
                .partsReplaced(record.getPartsReplaced())
                .remarks(record.getRemarks())
                .build();
    }
}
