package edu.trincoll.siem.Service;

import edu.trincoll.siem.Model.Alertrule;
import edu.trincoll.siem.Model.Enums.Severity;
import edu.trincoll.siem.Model.User;
import edu.trincoll.siem.Repository.AlertruleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class AlertruleService {

    @Autowired
    private AlertruleRepository alertruleRepository;

    public List<Alertrule> getAllAlertrules() {
        return alertruleRepository.findAll();
    }

    public Optional<Alertrule> getAlertruleById(Integer id) {
        return alertruleRepository.findById(id);
    }

    public Alertrule getAlertruleByName(String name) {
        return alertruleRepository.findByName(name);
    }

    public List<Alertrule> getAlertrulesByNameContaining(String nameSubstring) {
        return alertruleRepository.findByNameContainingIgnoreCase(nameSubstring);
    }

    public List<Alertrule> getAlertrulesByDescriptionContaining(String descriptionSubstring) {
        return alertruleRepository.findByDescriptionContainingIgnoreCase(descriptionSubstring);
    }

    public List<Alertrule> getAlertrulesBySeverity(Severity severity) {
        return alertruleRepository.findBySeverity(severity);
    }

    public List<Alertrule> getAlertrulesByIsActive(Boolean isActive) {
        return alertruleRepository.findByIsactive(isActive);
    }

    public List<Alertrule> getAlertrulesByCreator(User creator) {
        return alertruleRepository.findByCreatedby(creator);
    }

    public List<Alertrule> getAlertrulesCreatedAfter(Instant date) {
        return alertruleRepository.findByCreatedatAfter(date);
    }

    public List<Alertrule> getAlertrulesByActiveAndSeverity(Boolean isActive, Severity severity) {
        return alertruleRepository.findByIsactiveAndSeverity(isActive, severity);
    }

    public List<Object[]> countAlertrulesBySeverity() {
        return alertruleRepository.countRulesBySeverity();
    }

    public List<Object[]> countAlertrulesByCreator() {
        return alertruleRepository.countRulesByCreator();
    }

    public List<Alertrule> getAlertrulesByConditionLogic(String jsonCondition) {
        return alertruleRepository.findByConditionLogicContaining(jsonCondition);
    }

    public List<Alertrule> getLatestAlertrules(int limit) {
        return alertruleRepository.findLatestRules(PageRequest.of(0, limit));
    }

    public Alertrule saveAlertrule(Alertrule alertrule) {
        return alertruleRepository.save(alertrule);
    }

    public void deleteAlertruleById(Integer id) {
        alertruleRepository.deleteById(id);
    }

    public List<Object[]> getFrequentlyTriggeredRules(int minAlerts) {
        return alertruleRepository.getFrequentlyTriggeredRules(minAlerts);
    }
}