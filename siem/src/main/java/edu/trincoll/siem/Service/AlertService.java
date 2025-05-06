package edu.trincoll.siem.Service;

import edu.trincoll.siem.Model.Alert;
import edu.trincoll.siem.Model.Alertrule;
import edu.trincoll.siem.Model.Enums.AlertStatus;
import edu.trincoll.siem.Model.Enums.Severity;
import edu.trincoll.siem.Repository.AlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class AlertService {

    @Autowired
    private AlertRepository alertRepository;

    public List<Alert> getAllAlerts() {
        return alertRepository.findAll();
    }

    public Optional<Alert> getAlertById(Integer id) {
        return alertRepository.findById(id);
    }

    public List<Alert> getAlertsByStatus(AlertStatus status) {
        return alertRepository.findByStatus(status);
    }

    public List<Alert> getAlertsByRule(Alertrule rule) {
        return alertRepository.findByRuleid(rule);
    }

    public List<Alert> getAlertsByTimeRange(Instant start, Instant end) {
        return alertRepository.findByTriggeredatBetween(start, end);
    }

    public List<Alert> getAlertsByRuleAndStatus(Alertrule rule, AlertStatus status) {
        return alertRepository.findByRuleidAndStatus(rule, status);
    }

    public List<Object[]> countAlertsByStatus() {
        return alertRepository.countAlertsByStatus();
    }

    public List<Object[]> countAlertsByRule() {
        return alertRepository.countAlertsByRule();
    }

    public List<Alert> getLatestAlerts(int limit) {
        return alertRepository.findLatestAlerts(PageRequest.of(0, limit));
    }

    public List<Alert> getAlertsByRuleSeverity(Severity severity) {
        return alertRepository.findByRuleSeverity(severity);
    }

    public Alert saveAlert(Alert alert) {
        return alertRepository.save(alert);
    }

    public void deleteAlertById(Integer id) {
        alertRepository.deleteById(id);
    }

    public List<Object[]> getAlertSummaryByRule() {
        return alertRepository.getAlertSummaryByRule();
    }
}