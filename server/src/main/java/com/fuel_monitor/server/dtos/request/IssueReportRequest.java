package com.fuel_monitor.server.dtos.request;

import com.fuel_monitor.server.models.enums.IssueSeverity;
import com.fuel_monitor.server.models.enums.IssueType;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueReportRequest {
    private Long vehicleId;
    private IssueType issueType;
    private IssueSeverity severity;
    private String description;
}