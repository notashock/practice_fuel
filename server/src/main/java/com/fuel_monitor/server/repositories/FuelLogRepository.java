package com.fuel_monitor.server.repositories;

import com.fuel_monitor.server.models.entities.FuelLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FuelLogRepository extends JpaRepository<FuelLog, Long> {
    List<FuelLog> findByVehicleIdOrderByRefillDateDesc(Long vehicleId);

    // Required to calculate fuel efficiency over the last 30 days
    @Query("SELECT f FROM FuelLog f WHERE f.vehicle.id = :vehicleId AND f.refillDate >= :startDate")
    List<FuelLog> findRecentLogsByVehicle(@Param("vehicleId") Long vehicleId, @Param("startDate") LocalDateTime startDate);

    // To validate odometer readings are strictly increasing
    Optional<FuelLog> findFirstByVehicleIdOrderByOdometerAtRefillDesc(Long vehicleId);

    @Query("SELECT SUM(fl.fuelCost) FROM FuelLog fl WHERE fl.vehicle.id = :vehicleId AND fl.refillDate >= :startDate")
    Double sumFuelCostByVehicleAndDateRange(@Param("vehicleId") Long vehicleId, @Param("startDate") java.time.LocalDateTime startDate);
}