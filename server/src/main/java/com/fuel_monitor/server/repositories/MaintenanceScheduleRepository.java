package com.fuel_monitor.server.repositories;

import com.fuel_monitor.server.models.entities.MaintenanceSchedule;
import com.fuel_monitor.server.models.enums.ScheduleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceScheduleRepository extends JpaRepository<MaintenanceSchedule, Long> {
    List<MaintenanceSchedule> findByStatus(ScheduleStatus status);
    Optional<MaintenanceSchedule> findTopByVehicleIdOrderByNextServiceDueKMDesc(Long vehicleId);
}