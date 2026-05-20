package com.fuel_monitor.server.dtos.response;

import com.fuel_monitor.server.models.entities.MaintenanceSchedule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceScheduleResponse {
    private Long id;
    private Long vehicleId;
    private String vehicleRegistrationNumber;
    private String scheduleType;
    private Double serviceIntervalKM;
    private Double lastServiceKM;
    private Double nextServiceDueKM;
    private String status;

    public static MaintenanceScheduleResponse fromEntity(MaintenanceSchedule schedule) {
        if (schedule == null) return null;
        return MaintenanceScheduleResponse.builder()
                .id(schedule.getId())
                .vehicleId(schedule.getVehicle() != null ? schedule.getVehicle().getId() : null)
                .vehicleRegistrationNumber(schedule.getVehicle() != null ? schedule.getVehicle().getRegistrationNumber() : null)
                .scheduleType(schedule.getScheduleType() != null ? schedule.getScheduleType().name() : null)
                .serviceIntervalKM(schedule.getServiceIntervalKM())
                .lastServiceKM(schedule.getLastServiceKM())
                .nextServiceDueKM(schedule.getNextServiceDueKM())
                .status(schedule.getStatus() != null ? schedule.getStatus().name() : null)
                .build();
    }
}
