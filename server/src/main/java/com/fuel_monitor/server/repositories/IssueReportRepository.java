package com.fuel_monitor.server.repositories;

import com.fuel_monitor.server.models.entities.IssueReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueReportRepository extends JpaRepository<IssueReport, Long> {

    // AGGREGATE QUERY: Number of critical issues per month
    @Query("SELECT COUNT(i) FROM IssueReport i " +
            "WHERE i.severity = 'CRITICAL' " +
            "AND MONTH(i.reportedAt) = :month " +
            "AND YEAR(i.reportedAt) = :year")
    Long countCriticalIssuesByMonthAndYear(@Param("month") int month, @Param("year") int year);

    // JOIN QUERY: Fetch open issues with their associated Vehicle and Driver
    @Query("SELECT i FROM IssueReport i " +
            "JOIN FETCH i.vehicle v " +
            "JOIN FETCH i.reportedBy u " +
            "WHERE i.resolvedAt IS NULL")
    List<IssueReport> findAllOpenIssuesWithDetails();
}