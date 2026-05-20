package com.fuel_monitor.server.services;

import com.fuel_monitor.server.exceptions.BusinessRuleException;
import com.fuel_monitor.server.models.entities.FuelLog;
import com.fuel_monitor.server.models.entities.User;
import com.fuel_monitor.server.models.entities.Vehicle;
import com.fuel_monitor.server.models.enums.VehicleType;
import com.fuel_monitor.server.repositories.FuelLogRepository;
import com.fuel_monitor.server.repositories.UserRepository;
import com.fuel_monitor.server.repositories.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FuelService {

    private final FuelLogRepository fuelLogRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    @Transactional
    public FuelLog logFuel(Long vehicleId, Long driverId, FuelLog logDetails) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new BusinessRuleException("Vehicle not found"));
        User driver = userRepository.findById(driverId)
                .orElseThrow(() -> new BusinessRuleException("Driver not found"));

        if (logDetails.getFuelAmountLiters() < 1) {
            throw new BusinessRuleException("Fuel amount must be at least 1 liter"); // [cite: 229]
        }

        // Validate strictly increasing odometer
        FuelLog lastLog = fuelLogRepository.findFirstByVehicleIdOrderByOdometerAtRefillDesc(vehicleId).orElse(null);
        if (lastLog != null && logDetails.getOdometerAtRefill() <= lastLog.getOdometerAtRefill()) {
            throw new BusinessRuleException("Odometer reading must be strictly increasing"); // [cite: 210, 228]
        }

        // Calculate current efficiency
        if (lastLog != null) {
            double distanceCovered = logDetails.getOdometerAtRefill() - lastLog.getOdometerAtRefill();
            double currentEfficiency = distanceCovered / logDetails.getFuelAmountLiters(); // [cite: 216]

            validateEfficiencyBounds(vehicle.getVehicleType(), currentEfficiency); // [cite: 209]
            checkEfficiencyDrop(vehicleId, currentEfficiency);
        }

        logDetails.setVehicle(vehicle);
        logDetails.setDriver(driver);

        // Update vehicle's overall odometer
        vehicle.setOdometerReading(logDetails.getOdometerAtRefill());
        vehicleRepository.save(vehicle);

        return fuelLogRepository.save(logDetails);
    }

    private void validateEfficiencyBounds(VehicleType type, double efficiency) {
        if (type == VehicleType.TRUCK && (efficiency < 2 || efficiency > 10)) {
            throw new BusinessRuleException("Truck fuel efficiency must be between 2-10 km/l"); // [cite: 209]
        }
        if (type == VehicleType.CAR && (efficiency < 10 || efficiency > 20)) {
            throw new BusinessRuleException("Car fuel efficiency must be between 10-20 km/l"); // [cite: 209]
        }
    }

    private void checkEfficiencyDrop(Long vehicleId, double currentEfficiency) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<FuelLog> recentLogs = fuelLogRepository.findRecentLogsByVehicle(vehicleId, thirtyDaysAgo); // [cite: 221]

        if (recentLogs.size() > 1) {
            double totalDistance = 0;
            double totalFuel = 0;

            for (int i = 0; i < recentLogs.size() - 1; i++) {
                totalDistance += (recentLogs.get(i).getOdometerAtRefill() - recentLogs.get(i+1).getOdometerAtRefill());
                totalFuel += recentLogs.get(i).getFuelAmountLiters();
            }

            double averageEfficiency = totalDistance / totalFuel; // [cite: 221]
            if (currentEfficiency < (averageEfficiency * 0.8)) { // Drops by > 20%
                log.warn("ALERT: Fuel efficiency dropped by > 20% for vehicle ID: " + vehicleId); // [cite: 222]
                // Good to have: In a real system, trigger an email or notification here [cite: 335]
            }
        }
    }
}