package edu.trincoll.siem.Repository;

import edu.trincoll.siem.Model.Incidenteventlink;
import edu.trincoll.siem.Model.IncidenteventlinkId;
import edu.trincoll.siem.Model.Incidentreport;
import edu.trincoll.siem.Model.Logevent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IncidenteventlinkRepository extends JpaRepository<Incidenteventlink, IncidenteventlinkId> {
    // Find all links by incident report
    List<Incidenteventlink> findByReportid(Incidentreport report);

    // Find all links by log event
    List<Incidenteventlink> findByLogeventid(Logevent event);

    // Find specific link by both report and event (returns Optional since it's a unique combination)
    Optional<Incidenteventlink> findByReportidAndLogeventid(Incidentreport report, Logevent event);

    // Check if a specific link exists
    boolean existsByReportidAndLogeventid(Incidentreport report, Logevent event);

    // Count events linked to a specific report
    @Query("SELECT COUNT(l) FROM Incidenteventlink l WHERE l.reportid = :report")
    long countEventsByReport(@Param("report") Incidentreport report);

    // Count reports linked to a specific event
    @Query("SELECT COUNT(l) FROM Incidenteventlink l WHERE l.logeventid = :event")
    long countReportsByEvent(@Param("event") Logevent event);

    // Delete all links for a specific report (although this would happen automatically with CASCADE)
    void deleteByReportid(Incidentreport report);

    // Delete all links for a specific event (although this would happen automatically with CASCADE)
    void deleteByLogeventid(Logevent event);

    // Get reports with the most linked events
    @Query("SELECT l.reportid, COUNT(l) as eventCount FROM Incidenteventlink l " +
            "GROUP BY l.reportid ORDER BY eventCount DESC")
    List<Object[]> findReportsWithMostLinkedEvents(org.springframework.data.domain.Pageable pageable);
}