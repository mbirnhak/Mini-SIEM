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
    Optional<Incidentreport> findByTitle(String title);

    List<Incidentreport> findByTitleContainingIgnoreCase(String titleSubstring);

    List<Incidentreport> findByDescriptionContainingIgnoreCase(String descriptionSubstring);

    List<Incidentreport> findByCreatedby(User creator);

    List<Incidentreport> findByRelatedalertid(Alert relatedAlert);

    List<Incidentreport> findByCreatedatBetween(Instant startDate, Instant endDate);

    List<Incidentreport> findByCreatedatAfter(Instant date);

    List<Incidentreport> findByCreatedbyAndRelatedalertid(User creator, Alert relatedAlert);

    @Query("SELECT i.createdby.id, COUNT(i) FROM Incidentreport i GROUP BY i.createdby.id")
    List<Object[]> countReportsByCreator();

    @Query("SELECT i.relatedalertid.id, COUNT(i) FROM Incidentreport i WHERE i.relatedalertid IS NOT NULL GROUP BY i.relatedalertid.id")
    List<Object[]> countReportsByAlert();

    List<Incidentreport> findByRelatedalertidIsNull();

    @Query("SELECT i FROM Incidentreport i ORDER BY i.createdat DESC")
    List<Incidentreport> findLatestReports(org.springframework.data.domain.Pageable pageable);

    @Query("SELECT i FROM Incidentreport i WHERE " +
            "LOWER(i.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(i.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Incidentreport> searchReports(@Param("searchTerm") String searchTerm);

    List<Incidentreport> findByCreatedbyAndCreatedatBetween(User creator, Instant startDate, Instant endDate);

    @Query("SELECT FUNCTION('DATE', i.createdat) as reportDate, COUNT(i) " +
            "FROM Incidentreport i " +
            "GROUP BY FUNCTION('DATE', i.createdat) " +
            "ORDER BY i.createdat DESC")
    List<Object[]> countReportsPerDay();

    @Query(nativeQuery = true, value =
            "SELECT * FROM incidentreport ir " +
                    "WHERE ir.reportid IN (" +
                    "    SELECT iel.reportid FROM incidenteventlink iel " +
                    "    JOIN logevent le ON iel.logeventid = le.logeventid " +
                    "    JOIN rawline r ON le.rawline = r.rawline " +
                    "    JOIN action a ON r.action = a.action " +
                    "    JOIN eventcategory ec ON a.categoryname = ec.categoryname " +
                    "    WHERE ec.categoryname IN ('Critical', 'Security', 'Intrusion') " +
                    ") " +
                    "ORDER BY ir.createdat DESC")
    List<Incidentreport> getReportsWithCriticalEvents();

    @Query(nativeQuery = true, value =
            "SELECT * FROM incidentreport WHERE " +
                    "relatedalertid = :alertId " +
                    "UNION " +
                    "SELECT ir.* FROM incidentreport ir " +
                    "JOIN incidenteventlink iel ON ir.reportid = iel.reportid " +
                    "JOIN logevent le ON iel.logeventid = le.logeventid " +
                    "WHERE le.associatedalertid = :alertId " +
                    "EXCEPT " +
                    "SELECT ir.* FROM incidentreport ir " +
                    "WHERE ir.createdat < (SELECT triggeredat FROM alert WHERE alertid = :alertId)")
    List<Incidentreport> getReportsWithRelatedEvents(@Param("alertId") Integer alertId);
}