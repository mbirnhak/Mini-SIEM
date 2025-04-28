package edu.trincoll.siem.Repository;

import edu.trincoll.siem.Model.Alert;
import edu.trincoll.siem.Model.Incidentreport;
import edu.trincoll.siem.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface IncidentreportRepository extends JpaRepository<Incidentreport, Integer> {
    // Find reports by title (exact match)
    Optional<Incidentreport> findByTitle(String title);

    // Find reports by title containing a string (case-insensitive)
    List<Incidentreport> findByTitleContainingIgnoreCase(String titleSubstring);

    // Find reports by description containing a string (case-insensitive)
    List<Incidentreport> findByDescriptionContainingIgnoreCase(String descriptionSubstring);

    // Find reports created by a specific user
    List<Incidentreport> findByCreatedby(User creator);

    // Find reports related to a specific alert
    List<Incidentreport> findByRelatedalertid(Alert relatedAlert);

    // Find reports created within a date range
    List<Incidentreport> findByCreatedatBetween(Instant startDate, Instant endDate);

    // Find reports created after a specific date
    List<Incidentreport> findByCreatedatAfter(Instant date);

    // Find reports by creator and related alert
    List<Incidentreport> findByCreatedbyAndRelatedalertid(User creator, Alert relatedAlert);

    // Count reports by creator
    @Query("SELECT i.createdby.id, COUNT(i) FROM Incidentreport i GROUP BY i.createdby.id")
    List<Object[]> countReportsByCreator();

    // Count reports by related alert
    @Query("SELECT i.relatedalertid.id, COUNT(i) FROM Incidentreport i WHERE i.relatedalertid IS NOT NULL GROUP BY i.relatedalertid.id")
    List<Object[]> countReportsByAlert();

    // Find reports with no related alert
    List<Incidentreport> findByRelatedalertidIsNull();

    // Find latest reports (paginated)
    @Query("SELECT i FROM Incidentreport i ORDER BY i.createdat DESC")
    List<Incidentreport> findLatestReports(org.springframework.data.domain.Pageable pageable);

    // Search across title and description
    @Query("SELECT i FROM Incidentreport i WHERE " +
            "LOWER(i.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(i.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Incidentreport> searchReports(@Param("searchTerm") String searchTerm);

    // Find reports created by a user within a specific time period
    List<Incidentreport> findByCreatedbyAndCreatedatBetween(User creator, Instant startDate, Instant endDate);

    // Count reports created per day (for trending/analytics)
    @Query("SELECT FUNCTION('DATE', i.createdat) as reportDate, COUNT(i) " +
            "FROM Incidentreport i " +
            "GROUP BY FUNCTION('DATE', i.createdat) " +
            "ORDER BY i.createdat DESC")
    List<Object[]> countReportsPerDay();
}