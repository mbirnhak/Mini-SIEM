package edu.trincoll.siem.Service;

import edu.trincoll.siem.Model.Enums.Severity;
import edu.trincoll.siem.Model.Threatintel;
import edu.trincoll.siem.Repository.ThreatintelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ThreatintelService {

    @Autowired
    private ThreatintelRepository threatintelRepository;

    public List<Threatintel> getAllThreats() {
        return threatintelRepository.findAll();
    }

    public Optional<Threatintel> getThreatById(Integer id) {
        return threatintelRepository.findById(id);
    }

    public Optional<Threatintel> getThreatByIndicator(String indicator) {
        return threatintelRepository.findByIndicator(indicator);
    }

    public List<Threatintel> getThreatsByIndicatorContaining(String indicatorSubstring) {
        return threatintelRepository.findByIndicatorContainingIgnoreCase(indicatorSubstring);
    }

    public List<Threatintel> getThreatsByType(String type) {
        return threatintelRepository.findByType(type);
    }

    public List<Threatintel> getThreatsByTypeContaining(String typeSubstring) {
        return threatintelRepository.findByTypeContainingIgnoreCase(typeSubstring);
    }

    public List<Threatintel> getThreatsBySeverity(Severity severity) {
        return threatintelRepository.findBySeverity(severity);
    }

    public List<Threatintel> getThreatsByDescriptionContaining(String descriptionSubstring) {
        return threatintelRepository.findByDescriptionContainingIgnoreCase(descriptionSubstring);
    }

    public List<Threatintel> getThreatsByTypeAndSeverity(String type, Severity severity) {
        return threatintelRepository.findByTypeAndSeverity(type, severity);
    }

    public List<Threatintel> getThreatsByIndicatorPattern(String pattern) {
        return threatintelRepository.findByIndicatorPattern(pattern);
    }

    public boolean existsByIndicator(String indicator) {
        return threatintelRepository.existsByIndicator(indicator);
    }

    public List<Object[]> countThreatsByType() {
        return threatintelRepository.countByType();
    }

    public List<Object[]> countThreatsBySeverity() {
        return threatintelRepository.countBySeverity();
    }

    public List<Threatintel> searchThreats(String searchTerm) {
        return threatintelRepository.searchThreats(searchTerm);
    }

    public List<Threatintel> getThreatsBySeverityOrdered(Severity severity) {
        return threatintelRepository.findBySeverityOrderByIndicatorAsc(severity);
    }

    public List<Threatintel> advancedSearch(String type, Severity severity, String indicatorTerm) {
        return threatintelRepository.advancedSearch(type, severity, indicatorTerm);
    }

    public List<String> getAllDistinctTypes() {
        return threatintelRepository.findAllDistinctTypes();
    }

    public List<Threatintel> getTopThreats(int limit) {
        return threatintelRepository.findTopThreats(PageRequest.of(0, limit));
    }

    public Threatintel saveThreatintel(Threatintel threatintel) {
        return threatintelRepository.save(threatintel);
    }

    public void deleteThreatintelById(Integer id) {
        threatintelRepository.deleteById(id);
    }
}