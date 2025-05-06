package edu.trincoll.siem.Repository;

import edu.trincoll.siem.Model.Alert;
import edu.trincoll.siem.Model.Logfile;
import edu.trincoll.siem.Model.Logevent;
import edu.trincoll.siem.Model.Rawline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface LogeventRepository extends JpaRepository<Logevent, Integer> {
    // Find events by log file
    List<Logevent> findByFileid(Logfile file);

    // Find events by raw line
    List<Logevent> findByRawline(Rawline rawLine);

    // Find events by associated alert
    List<Logevent> findByAssociatedalertid(Alert alert);

    // Find events with no associated alert
    List<Logevent> findByAssociatedalertidIsNull();

    // Find events within a time range
    List<Logevent> findByTimestampBetween(Instant startTime, Instant endTime);

    // Find events after a specific time
    List<Logevent> findByTimestampAfter(Instant time);

    // Find events before a specific time
    List<Logevent> findByTimestampBefore(Instant time);

    // Find events by file and time range
    List<Logevent> findByFileidAndTimestampBetween(Logfile file, Instant startTime, Instant endTime);

    // Find events by file and associated alert
    List<Logevent> findByFileidAndAssociatedalertid(Logfile file, Alert alert);

    // Count events by file
    @Query("SELECT l.fileid.id, COUNT(l) FROM Logevent l GROUP BY l.fileid.id")
    List<Object[]> countEventsByFile();

    // Count events by associated alert
    @Query("SELECT l.associatedalertid.id, COUNT(l) FROM Logevent l WHERE l.associatedalertid IS NOT NULL GROUP BY l.associatedalertid.id")
    List<Object[]> countEventsByAlert();

    // Query to fetch log event count per hour from materialized view
    @Query(value = "SELECT bucket, logs_count, avg_message_length FROM logevent_count_per_hour WHERE bucket BETWEEN :startTime AND :endTime", nativeQuery = true)
    List<Object[]> getLogEventCountPerHour(@Param("startTime") Instant startTime, @Param("endTime") Instant endTime);

    // Find latest events (paginated)
    @Query("SELECT l FROM Logevent l ORDER BY l.timestamp DESC")
    List<Logevent> findLatestEvents(org.springframework.data.domain.Pageable pageable);

    // Find events by raw line content (requires join)
    @Query("SELECT l FROM Logevent l WHERE LOWER(l.rawline) LIKE LOWER(CONCAT('%', :content, '%'))")
    List<Logevent> findByRawlineContentContaining(@Param("content") String content);

    @Query(value = "SELECT date_trunc('hour', l1_0.\"timestamp\") AS truncated_timestamp, count(l1_0.logeventid) " +
            "FROM logevent l1_0 " +
            "WHERE l1_0.\"timestamp\" BETWEEN :startTime AND :endTime " +
            "GROUP BY truncated_timestamp " +
            "ORDER BY truncated_timestamp", nativeQuery = true)
    List<Object[]> getEventCountTimeSeries(@Param("startTime") Instant startTime, @Param("endTime") Instant endTime);

    // Find events by file and alert status
    @Query("SELECT l FROM Logevent l WHERE l.fileid = :file AND " +
            "((:hasAlert = true AND l.associatedalertid IS NOT NULL) OR " +
            "(:hasAlert = false AND l.associatedalertid IS NULL))")
    List<Logevent> findByFileAndAlertStatus(@Param("file") Logfile file, @Param("hasAlert") boolean hasAlert);

    @Query(nativeQuery = true, value =
            "SELECT le.logeventid, le.timestamp, lf.filename, lf.sourcename, " +
                    "r.rawline, r.message, sd.hostname AS source_hostname, dd.hostname AS dest_hostname, " +
                    "a.action, ec.categoryname " +
                    "FROM logevent le " +
                    "JOIN logfile lf ON le.fileid = lf.fileid " +
                    "JOIN rawline r ON le.rawline = r.rawline " +
                    "LEFT JOIN device sd ON r.sourcedeviceid = sd.deviceid " +
                    "LEFT JOIN device dd ON r.destinationdeviceid = dd.deviceid " +
                    "LEFT JOIN action a ON r.action = a.action " +
                    "LEFT JOIN eventcategory ec ON a.categoryname = ec.categoryname " +
                    "ORDER BY le.timestamp DESC")
    List<Object[]> getComplexEventReport();
}