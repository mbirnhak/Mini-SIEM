package edu.trincoll.siem.Repository;

import edu.trincoll.siem.Model.Alert;
import edu.trincoll.siem.Model.Alertrule;
import edu.trincoll.siem.Model.Enums.AlertStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Integer> {
    // Find alerts by status
    List<Alert> findByStatus(AlertStatus status);

    // Find alerts by rule
    List<Alert> findByRuleid(Alertrule rule);

    // Find alerts created within a time range
    List<Alert> findByTriggeredatBetween(Instant startTime, Instant endTime);

    // Find alerts by rule and status
    List<Alert> findByRuleidAndStatus(Alertrule rule, AlertStatus status);

    // Count alerts by status
    @Query("SELECT a.status, COUNT(a) FROM Alert a GROUP BY a.status")
    List<Object[]> countAlertsByStatus();

    // Count alerts by rule
    @Query("SELECT a.ruleid.id, a.ruleid.name, COUNT(a) FROM Alert a GROUP BY a.ruleid.id, a.ruleid.name")
    List<Object[]> countAlertsByRule();

    // Find latest alerts (paginated query example)
    @Query("SELECT a FROM Alert a ORDER BY a.triggeredat DESC")
    List<Alert> findLatestAlerts(org.springframework.data.domain.Pageable pageable);

    // Find alerts by rule severity (using join)
    @Query("SELECT a FROM Alert a WHERE a.ruleid.severity = :severity")
    List<Alert> findByRuleSeverity(@Param("severity") edu.trincoll.siem.Model.Enums.Severity severity);
}