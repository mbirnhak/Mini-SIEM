package edu.trincoll.siem.Repository;

import edu.trincoll.siem.Model.Alertrule;
import edu.trincoll.siem.Model.Enums.Severity;
import edu.trincoll.siem.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface AlertruleRepository extends JpaRepository<Alertrule, Integer> {
    // Find rules by name (exact match)
    Alertrule findByName(String name);

    // Find rules by name containing a string (case-insensitive)
    List<Alertrule> findByNameContainingIgnoreCase(String nameSubstring);

    // Find rules by description containing a string (case-insensitive)
    List<Alertrule> findByDescriptionContainingIgnoreCase(String descriptionSubstring);

    // Find rules by severity
    List<Alertrule> findBySeverity(Severity severity);

    // Find rules by active status
    List<Alertrule> findByIsactive(Boolean isActive);

    // Find rules by creator
    List<Alertrule> findByCreatedby(User creator);

    // Find rules created after a specific date
    List<Alertrule> findByCreatedatAfter(Instant date);

    // Find active rules by severity
    List<Alertrule> findByIsactiveAndSeverity(Boolean isActive, Severity severity);

    // Count rules by severity
    @Query("SELECT a.severity, COUNT(a) FROM Alertrule a GROUP BY a.severity")
    List<Object[]> countRulesBySeverity();

    // Count rules by creator
    @Query("SELECT a.createdby.id, COUNT(a) FROM Alertrule a GROUP BY a.createdby.id")
    List<Object[]> countRulesByCreator();

    // Find rules with specific conditions in the JSON (example query)
    @Query(value = "SELECT * FROM alertrule WHERE conditionlogic::jsonb @> :condition::jsonb", nativeQuery = true)
    List<Alertrule> findByConditionLogicContaining(@Param("condition") String jsonCondition);

    // Find latest rules (paginated)
    @Query("SELECT a FROM Alertrule a ORDER BY a.createdat DESC")
    List<Alertrule> findLatestRules(org.springframework.data.domain.Pageable pageable);

    @Query(nativeQuery = true, value =
            "SELECT ar.ruleid, ar.name, ar.severity, ar.description, " +
                    "COUNT(a.alertid) AS alert_count, " +
                    "MAX(a.triggeredat) AS last_triggered " +
                    "FROM alertrule ar " +
                    "JOIN alert a ON ar.ruleid = a.ruleid " +
                    "GROUP BY ar.ruleid, ar.name, ar.severity, ar.description " +
                    "HAVING COUNT(a.alertid) >= :minAlerts " +
                    "ORDER BY alert_count DESC")
    List<Object[]> getFrequentlyTriggeredRules(@Param("minAlerts") int minAlerts);
}