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
    private final MaintenanceService maintenanceService;

    @Transactional
    public FuelLog logFuel(Long vehicleId, Long driverId, FuelLog logDetails) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new BusinessRuleException("Vehicle not found"));
        User driver = userRepository.findById(driverId)
                .orElseThrow(() -> new BusinessRuleException("Driver not found"));

        // Validate vehicle is ACTIVE
        if (vehicle.getStatus() != com.fuel_monitor.server.models.enums.VehicleStatus.ACTIVE) {
            throw new BusinessRuleException("Fuel can only be logged for ACTIVE vehicles. Current status: " + vehicle.getStatus());
        }

        if (logDetails.getFuelAmountLiters() == null || logDetails.getFuelAmountLiters() < 1) {
            throw new BusinessRuleException("Fuel amount must be at least 1 liter");
        }

        if (logDetails.getFuelCost() == null || logDetails.getFuelCost() < 0) {
            throw new BusinessRuleException("Fuel cost must be valid and non-negative");
        }

        // Enforce monthly fuel budget limit (₹50,000)
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        Double currentMonthCost = fuelLogRepository.sumFuelCostByVehicleAndDateRange(vehicleId, startOfMonth);
        if (currentMonthCost == null) {
            currentMonthCost = 0.0;
        }
        double monthlyBudgetLimit = 50000.0;
        if (currentMonthCost + logDetails.getFuelCost() > monthlyBudgetLimit) {
            throw new BusinessRuleException("Logging this fuel log of ₹" + logDetails.getFuelCost() + " exceeds the monthly fuel budget limit of ₹" + monthlyBudgetLimit + " for this vehicle. Current month spending: ₹" + currentMonthCost);
        }

        // Validate strictly increasing odometer
        FuelLog lastLog = fuelLogRepository.findFirstByVehicleIdOrderByOdometerAtRefillDesc(vehicleId).orElse(null);
        if (lastLog != null && logDetails.getOdometerAtRefill() <= lastLog.getOdometerAtRefill()) {
            throw new BusinessRuleException("Odometer reading must be strictly increasing");
        }

        // Calculate current efficiency
        if (lastLog != null) {
            double distanceCovered = logDetails.getOdometerAtRefill() - lastLog.getOdometerAtRefill();
            double currentEfficiency = distanceCovered / logDetails.getFuelAmountLiters();

            validateEfficiencyBounds(vehicle.getVehicleType(), currentEfficiency);
            checkEfficiencyDrop(vehicleId, currentEfficiency);
        }

        logDetails.setVehicle(vehicle);
        logDetails.setDriver(driver);

        // Update vehicle's overall odometer
        vehicle.setOdometerReading(logDetails.getOdometerAtRefill());
        vehicleRepository.save(vehicle);

        // Trigger active maintenance status evaluation in real-time
        maintenanceService.evaluateMaintenanceStatus(vehicleId);

        return fuelLogRepository.save(logDetails);
    }

    private void validateEfficiencyBounds(VehicleType type, double efficiency) {
        if (type == VehicleType.TRUCK && (efficiency <= 2.0 || efficiency >= 10.0)) {
            throw new BusinessRuleException("Truck fuel efficiency must strictly be between 2-10 km/l");
        }
        if (type == VehicleType.CAR && (efficiency <= 10.0 || efficiency >= 20.0)) {
            throw new BusinessRuleException("Car fuel efficiency must strictly be between 10-20 km/l");
        }
    }

    private void checkEfficiencyDrop(Long vehicleId, double currentEfficiency) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<FuelLog> recentLogs = fuelLogRepository.findRecentLogsByVehicle(vehicleId, thirtyDaysAgo);

        if (recentLogs.size() > 1) {
            double totalDistance = 0;
            double totalFuel = 0;

            for (int i = 0; i < recentLogs.size() - 1; i++) {
                totalDistance += (recentLogs.get(i).getOdometerAtRefill() - recentLogs.get(i+1).getOdometerAtRefill());
                totalFuel += recentLogs.get(i).getFuelAmountLiters();
            }

            double averageEfficiency = totalDistance / totalFuel;
            if (currentEfficiency < (averageEfficiency * 0.8)) { // Drops by > 20%
                log.warn("ALERT: Fuel efficiency dropped by > 20% for vehicle ID: " + vehicleId);
            }
        }
    }
}