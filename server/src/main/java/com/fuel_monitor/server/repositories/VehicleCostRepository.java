package com.fuel_monitor.server.repositories;

import com.fuel_monitor.server.models.entities.VehicleCost;
import com.fuel_monitor.server.models.enums.CostType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface VehicleCostRepository extends JpaRepository<VehicleCost, Long> {

    @Query("SELECT SUM(vc.amount) FROM VehicleCost vc " +
            "WHERE vc.vehicle.id = :vehicleId " +
            "AND vc.costType = :costType " +
            "AND YEAR(vc.recordedAt) = :year")
    Double getTotalCostByVehicleAndTypeAndYear(
            @Param("vehicleId") Long vehicleId,
            @Param("costType") CostType costType,
            @Param("year") int year
    );

    @Query("SELECT SUM(vc.amount) FROM VehicleCost vc " +
            "WHERE vc.costType = :costType " +
            "AND YEAR(vc.recordedAt) = :year")
    Double getTotalCostByTypeAndYear(
            @Param("costType") CostType costType,
            @Param("year") int year
    );

    java.util.List<VehicleCost> findByVehicleId(Long vehicleId);
}