package com.fuel_monitor.server.repositories;

import com.fuel_monitor.server.models.entities.VehicleCost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface VehicleCostRepository extends JpaRepository<VehicleCost, Long> {

    // AGGREGATE QUERY: Total maintenance cost per vehicle per year
    @Query("SELECT SUM(vc.amount) FROM VehicleCost vc " +
            "WHERE vc.vehicle.id = :vehicleId " +
            "AND vc.costType = 'MAINTENANCE' " +
            "AND YEAR(vc.recordedAt) = :year")
    Double getTotalMaintenanceCostByVehicleAndYear(@Param("vehicleId") Long vehicleId, @Param("year") int year);
}