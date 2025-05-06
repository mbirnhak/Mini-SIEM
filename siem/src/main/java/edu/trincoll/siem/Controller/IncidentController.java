package edu.trincoll.siem.Controller;

import edu.trincoll.siem.Model.Incidentreport;
import edu.trincoll.siem.Model.Incidenteventlink;
import edu.trincoll.siem.Model.Logevent;
import edu.trincoll.siem.Service.IncidentreportService;
import edu.trincoll.siem.Service.IncidenteventlinkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    @Autowired
    private IncidentreportService incidentreportService;

    @Autowired
    private IncidenteventlinkService incidenteventlinkService;

    // Get an incident report by its title
    @GetMapping("/report/{title}")
    public ResponseEntity<Incidentreport> getReportByTitle(@PathVariable String title) {
        Optional<Incidentreport> report = incidentreportService.getReportByTitle(title);
        return report.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Get incident reports by a user
    @GetMapping("/reports/user/{userId}")
    public ResponseEntity<List<Incidentreport>> getReportsByUser(@PathVariable Integer userId) {
        List<Incidentreport> reports = incidentreportService.getReportsByUser(userId);
        return ResponseEntity.ok(reports);
    }

    // Get incident reports by alert
    @GetMapping("/reports/alert/{alertId}")
    public ResponseEntity<List<Incidentreport>> getReportsByAlert(@PathVariable Integer alertId) {
        List<Incidentreport> reports = incidentreportService.getReportsByAlert(alertId);
        return ResponseEntity.ok(reports);
    }

    // Get all links for a specific incident report
    @GetMapping("/links/report/{reportId}")
    public ResponseEntity<List<Incidenteventlink>> getLinksByReport(@PathVariable Integer reportId) {
        Incidentreport report = incidentreportService.getReportById(reportId).orElse(null);
        if (report != null) {
            List<Incidenteventlink> links = incidenteventlinkService.getLinksByIncidentReport(report);
            return ResponseEntity.ok(links);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // Get all links for a specific log event
    @GetMapping("/links/event/{eventId}")
    public ResponseEntity<List<Incidenteventlink>> getLinksByEvent(@PathVariable Integer eventId) {
        Logevent event = new Logevent();
        event.setId(eventId);
        List<Incidenteventlink> links = incidenteventlinkService.getLinksByLogEvent(event);
        return ResponseEntity.ok(links);
    }

    // Check if a specific link exists
    @GetMapping("/link/exists/{reportId}/{eventId}")
    public ResponseEntity<Boolean> doesLinkExist(@PathVariable Integer reportId, @PathVariable Integer eventId) {
        Incidentreport report = incidentreportService.getReportById(reportId).orElse(null);
        Logevent event = new Logevent();
        event.setId(eventId);
        if (report != null) {
            boolean exists = incidenteventlinkService.doesLinkExist(report, event);
            return ResponseEntity.ok(exists);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // Count events linked to a specific report
    @GetMapping("/report/{reportId}/eventCount")
    public ResponseEntity<Long> countEventsByReport(@PathVariable Integer reportId) {
        Incidentreport report = incidentreportService.getReportById(reportId).orElse(null);
        if (report != null) {
            long count = incidenteventlinkService.countEventsByReport(report);
            return ResponseEntity.ok(count);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // Count reports linked to a specific event
    @GetMapping("/event/{eventId}/reportCount")
    public ResponseEntity<Long> countReportsByEvent(@PathVariable Integer eventId) {
        Logevent event = new Logevent();
        event.setId(eventId);
        long count = incidenteventlinkService.countReportsByEvent(event);
        return ResponseEntity.ok(count);
    }

    // Delete all links for a specific report
    @DeleteMapping("/links/report/{reportId}")
    public ResponseEntity<Void> deleteLinksByReport(@PathVariable Integer reportId) {
        Incidentreport report = incidentreportService.getReportById(reportId).orElse(null);
        if (report != null) {
            incidenteventlinkService.deleteLinksByReport(report);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // Delete all links for a specific event
    @DeleteMapping("/links/event/{eventId}")
    public ResponseEntity<Void> deleteLinksByEvent(@PathVariable Integer eventId) {
        Logevent event = new Logevent();
        event.setId(eventId);
        incidenteventlinkService.deleteLinksByEvent(event);
        return ResponseEntity.noContent().build();
    }

    // Get reports with the most linked events (paginated)
    @GetMapping("/reports/most-linked")
    public ResponseEntity<List<Object[]>> getReportsWithMostLinkedEvents(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        List<Object[]> reports = incidenteventlinkService.getReportsWithMostLinkedEvents(page, size);
        return ResponseEntity.ok(reports);
    }

    // Get reports created within a specific date range
    @GetMapping("/reports/dateRange")
    public ResponseEntity<List<Incidentreport>> getReportsByDateRange(
            @RequestParam Instant startDate,
            @RequestParam Instant endDate) {
        List<Incidentreport> reports = incidentreportService.getReportsByDateRange(startDate, endDate);
        return ResponseEntity.ok(reports);
    }

    // Create a new incident report
    @PostMapping("/report")
    public ResponseEntity<Incidentreport> createIncidentReport(@RequestBody Incidentreport incidentreport) {
        Incidentreport createdReport = incidentreportService.saveReport(incidentreport);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdReport);
    }

    // Create a new incident event link
    @PostMapping("/link")
    public ResponseEntity<Incidenteventlink> createIncidenteventlink(@RequestBody Incidenteventlink incidenteventlink) {
        Incidenteventlink createdLink = incidenteventlinkService.saveLink(incidenteventlink);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdLink);
    }

    /**
     * Finds incident reports linked to critical events using subqueries
     * This is a non-trivial subquery application
     */
    @GetMapping("/reports/with-critical-events")
    public ResponseEntity<List<Incidentreport>> getReportsWithCriticalEvents() {
        return ResponseEntity.ok(incidentreportService.getReportsWithCriticalEvents());
    }

    /**
     * Finds reports with events related to a specific alert using set operations (UNION, EXCEPT)
     * This implements set operations in SQL
     * @param alertId The ID of the alert to find related events for
     */
    @GetMapping("/reports/with-related-events")
    public ResponseEntity<List<Incidentreport>> getReportsWithRelatedEvents(
            @RequestParam Integer alertId) {
        return ResponseEntity.ok(incidentreportService.getReportsWithRelatedEvents(alertId));
    }
}