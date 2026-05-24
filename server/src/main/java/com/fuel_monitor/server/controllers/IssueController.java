package com.fuel_monitor.server.controllers;

import com.fuel_monitor.server.dtos.request.IssueReportRequest;
import com.fuel_monitor.server.exceptions.BusinessRuleException;
import com.fuel_monitor.server.models.entities.IssueReport;
import com.fuel_monitor.server.models.entities.User;
import com.fuel_monitor.server.models.entities.Vehicle;
import com.fuel_monitor.server.repositories.IssueReportRepository;
import com.fuel_monitor.server.repositories.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueReportRepository issueRepository;
    private final VehicleRepository vehicleRepository;

    @PostMapping
    public ResponseEntity<IssueReport> reportIssue(
            @RequestBody IssueReportRequest request,
            @AuthenticationPrincipal User driver
    ) {
        if (request.getSeverity() == null) {
            throw new BusinessRuleException("Issue severity must be provided");
        }

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new BusinessRuleException("Vehicle not found"));

        IssueReport issue = IssueReport.builder()
                .vehicle(vehicle)
                .reportedBy(driver)
                .issueType(request.getIssueType())
                .severity(request.getSeverity())
                .description(request.getDescription())
                .build();

        return ResponseEntity.ok(issueRepository.save(issue));
    }

    @GetMapping("/open")
    public ResponseEntity<List<IssueReport>> getOpenIssues() {
        // Utilizing the custom JOIN query from Phase 3!
        return ResponseEntity.ok(issueRepository.findAllOpenIssuesWithDetails());
    }

    @PutMapping("/{id}/acknowledge")
    public ResponseEntity<IssueReport> acknowledgeIssue(@PathVariable Long id) {
        IssueReport issue = issueRepository.findById(id)
                .orElseThrow(() -> new BusinessRuleException("Issue not found"));
        // Additional logic for acknowledgement can go here
        return ResponseEntity.ok(issue);
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<IssueReport> resolveIssue(
            @PathVariable Long id,
            @AuthenticationPrincipal User mechanic
    ) {
        IssueReport issue = issueRepository.findById(id)
                .orElseThrow(() -> new BusinessRuleException("Issue not found"));

        issue.setResolvedAt(LocalDateTime.now());
        issue.setResolvedBy(mechanic);

        return ResponseEntity.ok(issueRepository.save(issue));
    }
}