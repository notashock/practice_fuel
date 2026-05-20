package com.fuel_monitor.server.repositories;

import com.fuel_monitor.server.models.entities.VehicleActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleActivityLogRepository extends JpaRepository<VehicleActivityLog, Long> {
    List<VehicleActivityLog> findByVehicleIdOrderByTimestampDesc(Long vehicleId);
}