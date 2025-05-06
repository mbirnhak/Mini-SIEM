package edu.trincoll.siem.Controller;

import edu.trincoll.siem.Model.Alert;
import edu.trincoll.siem.Model.Alertrule;
import edu.trincoll.siem.Model.Enums.AlertStatus;
import edu.trincoll.siem.Model.Enums.Severity;
import edu.trincoll.siem.Model.Threatintel;
import edu.trincoll.siem.Service.AlertService;
import edu.trincoll.siem.Service.AlertruleService;
import edu.trincoll.siem.Service.ThreatintelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class AlertController {

    @Autowired
    private AlertService alertService;

    @Autowired
    private AlertruleService alertruleService;

    @Autowired
    private ThreatintelService threatintelService;

    // ** Alert Endpoints **

    @GetMapping("/alerts")
    public List<Alert> getAllAlerts() {
        return alertService.getAllAlerts();
    }

    @GetMapping("/alerts/{id}")
    public Optional<Alert> getAlertById(@PathVariable Integer id) {
        return alertService.getAlertById(id);
    }

    @GetMapping("/alerts/status/{status}")
    public List<Alert> getAlertsByStatus(@PathVariable AlertStatus status) {
        return alertService.getAlertsByStatus(status);
    }

    @GetMapping("/alerts/rule/{ruleId}")
    public List<Alert> getAlertsByRule(@PathVariable Integer ruleId) {
        Alertrule rule = alertruleService.getAlertruleById(ruleId).orElse(null);
        if (rule != null) {
            return alertService.getAlertsByRule(rule);
        }
        return List.of();
    }

    @GetMapping("/alerts/range")
    public List<Alert> getAlertsByTimeRange(@RequestParam Instant start, @RequestParam Instant end) {
        return alertService.getAlertsByTimeRange(start, end);
    }

    @GetMapping("/alerts/rule/{ruleId}/status/{status}")
    public List<Alert> getAlertsByRuleAndStatus(@PathVariable Integer ruleId, @PathVariable AlertStatus status) {
        Alertrule rule = alertruleService.getAlertruleById(ruleId).orElse(null);
        if (rule != null) {
            return alertService.getAlertsByRuleAndStatus(rule, status);
        }
        return List.of();
    }

    @GetMapping("/alerts/latest")
    public List<Alert> getLatestAlerts(@RequestParam int limit) {
        return alertService.getLatestAlerts(limit);
    }

    @PutMapping("/alerts/{id}/status")
    public ResponseEntity<?> updateAlertStatus(@PathVariable Integer id, @RequestParam("status") String statusParam) {
        AlertStatus status;

        // Validate the status string against the enum
        try {
            status = AlertStatus.valueOf(statusParam);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status value. Allowed values: Open, Investigating, Resolved.");
        }

        Optional<Alert> alertOptional = alertService.getAlertById(id);

        if (alertOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Alert alert = alertOptional.get();
        alert.setStatus(status);
        alertService.saveAlert(alert);  // Ensure it's persisted

        return ResponseEntity.ok(alert);  // Optionally return the updated alert
    }

    // ** Alertrule Endpoints **

    @GetMapping("/alertrules")
    public List<Alertrule> getAllAlertrules() {
        return alertruleService.getAllAlertrules();
    }

    @GetMapping("/alertrules/{id}")
    public Optional<Alertrule> getAlertruleById(@PathVariable Integer id) {
        return alertruleService.getAlertruleById(id);
    }

    @GetMapping("/alertrules/name/{name}")
    public Alertrule getAlertruleByName(@PathVariable String name) {
        return alertruleService.getAlertruleByName(name);
    }

    @GetMapping("/alertrules/severity/{severity}")
    public List<Alertrule> getAlertrulesBySeverity(@PathVariable Severity severity) {
        return alertruleService.getAlertrulesBySeverity(severity);
    }

    @GetMapping("/alertrules/active/{isActive}")
    public List<Alertrule> getAlertrulesByIsActive(@PathVariable Boolean isActive) {
        return alertruleService.getAlertrulesByIsActive(isActive);
    }

    @PostMapping("/alertrules")
    public Alertrule createAlertrule(@RequestBody Alertrule alertrule) {
        return alertruleService.saveAlertrule(alertrule);
    }

    @DeleteMapping("/alertrules/{id}")
    public void deleteAlertrule(@PathVariable Integer id) {
        alertruleService.deleteAlertruleById(id);
    }

    // ** ThreatIntel Endpoints **

    @GetMapping("/threats")
    public List<Threatintel> getAllThreats() {
        return threatintelService.getAllThreats();
    }

    @GetMapping("/threats/{id}")
    public Optional<Threatintel> getThreatById(@PathVariable Integer id) {
        return threatintelService.getThreatById(id);
    }

    @GetMapping("/threats/indicator/{indicator}")
    public Optional<Threatintel> getThreatByIndicator(@PathVariable String indicator) {
        return threatintelService.getThreatByIndicator(indicator);
    }

    @GetMapping("/threats/severity/{severity}")
    public List<Threatintel> getThreatsBySeverity(@PathVariable Severity severity) {
        return threatintelService.getThreatsBySeverity(severity);
    }

    @GetMapping("/threats/type/{type}")
    public List<Threatintel> getThreatsByType(@PathVariable String type) {
        return threatintelService.getThreatsByType(type);
    }

    @GetMapping("/threats/advanced")
    public List<Threatintel> advancedSearch(@RequestParam String type, @RequestParam Severity severity, @RequestParam String indicatorTerm) {
        return threatintelService.advancedSearch(type, severity, indicatorTerm);
    }

    @GetMapping("/threats/top")
    public List<Threatintel> getTopThreats(@RequestParam int limit) {
        return threatintelService.getTopThreats(limit);
    }

    @PostMapping("/threats")
    public Threatintel createThreatintel(@RequestBody Threatintel threatintel) {
        return threatintelService.saveThreatintel(threatintel);
    }

    @DeleteMapping("/threats/{id}")
    public void deleteThreatintel(@PathVariable Integer id) {
        threatintelService.deleteThreatintelById(id);
    }

    /**
     * Gets summary statistics of alerts grouped by rule using subqueries
     * Uses aggregate functions (COUNT, MAX) with subqueries
     */
    @GetMapping("/alerts/summary-by-rule")
    public ResponseEntity<List<Object[]>> getAlertSummaryByRule() {
        return ResponseEntity.ok(alertService.getAlertSummaryByRule());
    }

    /**
     * Finds alert rules that have been triggered frequently
     * Uses GROUP BY with HAVING clause
     * @param minAlerts Minimum number of alerts to consider "frequent" (default: 5)
     */
    @GetMapping("/alertrules/frequently-triggered")
    public ResponseEntity<List<Object[]>> getFrequentlyTriggeredRules(
            @RequestParam(defaultValue = "5") int minAlerts) {
        return ResponseEntity.ok(alertruleService.getFrequentlyTriggeredRules(minAlerts));
    }
}