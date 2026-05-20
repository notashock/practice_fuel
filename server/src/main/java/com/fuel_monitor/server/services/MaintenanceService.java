package com.fuel_monitor.server.services;

import com.fuel_monitor.server.exceptions.BusinessRuleException;
import com.fuel_monitor.server.models.entities.MaintenanceSchedule;
import com.fuel_monitor.server.models.entities.Vehicle;
import com.fuel_monitor.server.models.enums.ScheduleStatus;
import com.fuel_monitor.server.repositories.MaintenanceScheduleRepository;
import com.fuel_monitor.server.repositories.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceScheduleRepository scheduleRepository;
    private final VehicleRepository vehicleRepository;

    @Transactional
    public void evaluateMaintenanceStatus(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new BusinessRuleException("Vehicle not found"));

        MaintenanceSchedule activeSchedule = scheduleRepository.findTopByVehicleIdOrderByNextServiceDueKMDesc(vehicleId)
                .orElse(null);

        if (activeSchedule != null && activeSchedule.getStatus() == ScheduleStatus.PENDING) {
            double currentOdometer = vehicle.getOdometerReading();
            double dueAt = activeSchedule.getNextServiceDueKM();

            // Overdue if 500 km past due
            if (currentOdometer >= (dueAt + 500)) {
                activeSchedule.setStatus(ScheduleStatus.OVERDUE); // [cite: 144]
                scheduleRepository.save(activeSchedule);
            }
        }
    }

    @Transactional
    public MaintenanceSchedule createPreventiveSchedule(Long vehicleId, double currentOdometer) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new BusinessRuleException("Vehicle not found"));

        MaintenanceSchedule schedule = MaintenanceSchedule.builder()
                .vehicle(vehicle)
                .scheduleType(com.fuel_monitor.server.models.enums.ScheduleType.PREVENTIVE)
                .serviceIntervalKM(5000.0) // Preventive maintenance every 5,000 km [cite: 137, 207]
                .lastServiceKM(currentOdometer)
                .nextServiceDueKM(currentOdometer + 5000.0)
                .status(ScheduleStatus.PENDING)
                .build();

        return scheduleRepository.save(schedule);
    }
}