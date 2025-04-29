package edu.trincoll.siem.Service;

import edu.trincoll.siem.Model.Incidentreport;
import edu.trincoll.siem.Model.Alert;
import edu.trincoll.siem.Model.User;
import edu.trincoll.siem.Repository.IncidentreportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class IncidentreportService {

    @Autowired
    private IncidentreportRepository incidentreportRepository;

    // Get report by title
    public Optional<Incidentreport> getReportByTitle(String title) {
        return incidentreportRepository.findByTitle(title);
    }

    // Get all reports by a user
    public List<Incidentreport> getReportsByUser(Integer userId) {
        User user = new User();
        user.setId(userId);
        return incidentreportRepository.findByCreatedby(user);
    }

    // Get reports by related alert
    public List<Incidentreport> getReportsByAlert(Integer alertId) {
        Alert alert = new Alert();
        alert.setId(alertId);
        return incidentreportRepository.findByRelatedalertid(alert);
    }

    // Get reports created within a date range
    public List<Incidentreport> getReportsByDateRange(Instant startDate, Instant endDate) {
        return incidentreportRepository.findByCreatedatBetween(startDate, endDate);
    }

    // Get a specific report by its ID
    public Optional<Incidentreport> getReportById(Integer reportId) {
        return incidentreportRepository.findById(reportId);
    }

    // Create a new report
    public Incidentreport saveReport(Incidentreport incidentreport) {
        return incidentreportRepository.save(incidentreport);
    }

    // Get the latest reports with pagination
    public List<Incidentreport> getLatestReports(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return incidentreportRepository.findLatestReports(pageable);
    }

    // Search reports by title and description
    public List<Incidentreport> searchReports(String searchTerm) {
        return incidentreportRepository.searchReports(searchTerm);
    }

    // Count reports by creator
    public List<Object[]> countReportsByCreator() {
        return incidentreportRepository.countReportsByCreator();
    }

    // Count reports by alert
    public List<Object[]> countReportsByAlert() {
        return incidentreportRepository.countReportsByAlert();
    }

    // Count reports per day for analytics
    public List<Object[]> countReportsPerDay() {
        return incidentreportRepository.countReportsPerDay();
    }
}