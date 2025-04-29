package edu.trincoll.siem.Service;

import edu.trincoll.siem.Model.Incidenteventlink;
import edu.trincoll.siem.Model.Incidentreport;
import edu.trincoll.siem.Model.Logevent;
import edu.trincoll.siem.Repository.IncidenteventlinkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class IncidenteventlinkService {

    @Autowired
    private IncidenteventlinkRepository incidenteventlinkRepository;

    // Find all links by incident report
    public List<Incidenteventlink> getLinksByIncidentReport(Incidentreport report) {
        return incidenteventlinkRepository.findByReportid(report);
    }

    // Find all links by log event
    public List<Incidenteventlink> getLinksByLogEvent(Logevent event) {
        return incidenteventlinkRepository.findByLogeventid(event);
    }

    // Find specific link by both report and event
    public Optional<Incidenteventlink> getLinkByReportAndEvent(Incidentreport report, Logevent event) {
        return incidenteventlinkRepository.findByReportidAndLogeventid(report, event);
    }

    // Check if a specific link exists
    public boolean doesLinkExist(Incidentreport report, Logevent event) {
        return incidenteventlinkRepository.existsByReportidAndLogeventid(report, event);
    }

    // Count events linked to a specific report
    public long countEventsByReport(Incidentreport report) {
        return incidenteventlinkRepository.countEventsByReport(report);
    }

    // Count reports linked to a specific event
    public long countReportsByEvent(Logevent event) {
        return incidenteventlinkRepository.countReportsByEvent(event);
    }

    // Delete all links for a specific report
    public void deleteLinksByReport(Incidentreport report) {
        incidenteventlinkRepository.deleteByReportid(report);
    }

    // Delete all links for a specific event
    public void deleteLinksByEvent(Logevent event) {
        incidenteventlinkRepository.deleteByLogeventid(event);
    }

    // Get reports with the most linked events (paginated)
    public List<Object[]> getReportsWithMostLinkedEvents(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return incidenteventlinkRepository.findReportsWithMostLinkedEvents(pageable);
    }

    // Save a new incidenteventlink
    public Incidenteventlink saveLink(Incidenteventlink incidenteventlink) {
        return incidenteventlinkRepository.save(incidenteventlink);
    }
}