package com.fuel_monitor.server.controllers;

import com.fuel_monitor.server.dtos.request.IssueReportRequest;
import com.fuel_monitor.server.dtos.response.IssueReportResponse;
import com.fuel_monitor.server.exceptions.BusinessRuleException;
import com.fuel_monitor.server.models.entities.IssueReport;
import com.fuel_monitor.server.models.entities.User;
import com.fuel_monitor.server.models.entities.Vehicle;
import com.fuel_monitor.server.models.enums.VehicleStatus;
import com.fuel_monitor.server.repositories.IssueReportRepository;
import com.fuel_monitor.server.repositories.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueReportRepository issueRepository;
    private final VehicleRepository vehicleRepository;

    @PostMapping
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<IssueReportResponse> reportIssue(
            @RequestBody IssueReportRequest request,
            @AuthenticationPrincipal User driver
    ) {
        if (request.getSeverity() == null) {
            throw new BusinessRuleException("Issue severity must be provided");
        }

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new BusinessRuleException("Vehicle not found"));

        if (vehicle.getStatus() == VehicleStatus.RETIRED) {
            throw new BusinessRuleException("Mechanical issues cannot be reported for RETIRED vehicles.");
        }

        IssueReport issue = IssueReport.builder()
                .vehicle(vehicle)
                .reportedBy(driver)
                .issueType(request.getIssueType())
                .severity(request.getSeverity())
                .description(request.getDescription())
                .build();

        IssueReport saved = issueRepository.save(issue);
        return ResponseEntity.ok(IssueReportResponse.fromEntity(saved));
    }

    @GetMapping("/open")
    @PreAuthorize("hasAnyRole('FLEET_MANAGER', 'ADMIN', 'MECHANIC', 'DRIVER')")
    public ResponseEntity<List<IssueReportResponse>> getOpenIssues() {
        List<IssueReportResponse> responses = issueRepository.findAllOpenIssuesWithDetails().stream()
                .map(IssueReportResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}/acknowledge")
    @PreAuthorize("hasRole('MECHANIC')")
    public ResponseEntity<IssueReportResponse> acknowledgeIssue(@PathVariable Long id) {
        IssueReport issue = issueRepository.findById(id)
                .orElseThrow(() -> new BusinessRuleException("Issue not found"));
        // Additional logic for acknowledgement can go here
        return ResponseEntity.ok(IssueReportResponse.fromEntity(issue));
    }

    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasRole('MECHANIC')")
    public ResponseEntity<IssueReportResponse> resolveIssue(
            @PathVariable Long id,
            @AuthenticationPrincipal User mechanic
    ) {
        IssueReport issue = issueRepository.findById(id)
                .orElseThrow(() -> new BusinessRuleException("Issue not found"));

        issue.setResolvedAt(LocalDateTime.now());
        issue.setResolvedBy(mechanic);

        IssueReport saved = issueRepository.save(issue);
        return ResponseEntity.ok(IssueReportResponse.fromEntity(saved));
    }
}