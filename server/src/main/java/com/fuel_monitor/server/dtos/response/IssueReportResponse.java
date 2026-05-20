package com.fuel_monitor.server.dtos.response;

import com.fuel_monitor.server.models.entities.IssueReport;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueReportResponse {
    private Long id;
    private Long vehicleId;
    private String vehicleRegistrationNumber;
    private Long reportedById;
    private String reportedByName;
    private String issueType;
    private String severity;
    private String description;
    private LocalDateTime reportedAt;
    private LocalDateTime resolvedAt;
    private Long resolvedById;
    private String resolvedByName;

    public static IssueReportResponse fromEntity(IssueReport report) {
        if (report == null) return null;
        return IssueReportResponse.builder()
                .id(report.getId())
                .vehicleId(report.getVehicle() != null ? report.getVehicle().getId() : null)
                .vehicleRegistrationNumber(report.getVehicle() != null ? report.getVehicle().getRegistrationNumber() : null)
                .reportedById(report.getReportedBy() != null ? report.getReportedBy().getId() : null)
                .reportedByName(report.getReportedBy() != null ? report.getReportedBy().getName() : null)
                .issueType(report.getIssueType() != null ? report.getIssueType().name() : null)
                .severity(report.getSeverity() != null ? report.getSeverity().name() : null)
                .description(report.getDescription())
                .reportedAt(report.getReportedAt())
                .resolvedAt(report.getResolvedAt())
                .resolvedById(report.getResolvedBy() != null ? report.getResolvedBy().getId() : null)
                .resolvedByName(report.getResolvedBy() != null ? report.getResolvedBy().getName() : null)
                .build();
    }
}
