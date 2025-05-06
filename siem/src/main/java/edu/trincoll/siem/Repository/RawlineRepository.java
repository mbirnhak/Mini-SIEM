package edu.trincoll.siem.Repository;

import edu.trincoll.siem.Model.Action;
import edu.trincoll.siem.Model.Device;
import edu.trincoll.siem.Model.Rawline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RawlineRepository extends JpaRepository<Rawline, String> {
    // Find by exact raw line (this is redundant as it's the primary key, but included for completeness)
    Optional<Rawline> findByRawline(String rawline);

    // Find by source device
    List<Rawline> findBySourcedeviceid(Device sourceDevice);

    // Find by destination device
    List<Rawline> findByDestinationdeviceid(Device destinationDevice);

    // Find by action
    List<Rawline> findByAction(Action action);

    // Find by source port
    List<Rawline> findBySourceport(Integer sourcePort);

    // Find by destination port
    List<Rawline> findByDestinationport(Integer destinationPort);

    // Find by message containing text (case-insensitive)
    List<Rawline> findByMessageContainingIgnoreCase(String messageSubstring);

    // Find by source device and action
    List<Rawline> findBySourcedeviceidAndAction(Device sourceDevice, Action action);

    // Find by destination device and action
    List<Rawline> findByDestinationdeviceidAndAction(Device destinationDevice, Action action);

    // Find by source and destination devices
    List<Rawline> findBySourcedeviceidAndDestinationdeviceid(Device sourceDevice, Device destinationDevice);

    // Find by source device and port
    List<Rawline> findBySourcedeviceidAndSourceport(Device sourceDevice, Integer sourcePort);

    // Find by destination device and port
    List<Rawline> findByDestinationdeviceidAndDestinationport(Device destinationDevice, Integer destinationPort);

    // Full text search using PostgreSQL tsvector ordered by relevance score
    @Query(value = "SELECT *, ts_rank(search_vector, plainto_tsquery('english', :searchTerms)) AS rank " +
            "FROM rawline WHERE search_vector @@ plainto_tsquery('english', :searchTerms) " +
            "ORDER BY rank DESC",
            nativeQuery = true)
    List<Rawline> fullTextSearchRanked(@Param("searchTerms") String searchTerms);

    // Search in JSON parsed data for a specific key-value pair (PostgreSQL specific)
    @Query(value = "SELECT * FROM rawline WHERE parseddata->>:key = :value",
            nativeQuery = true)
    List<Rawline> findByParseddataKeyValue(@Param("key") String key, @Param("value") String value);

    // Search in JSON parsed data for a key containing a specific value (PostgreSQL specific)
    @Query(value = "SELECT * FROM rawline WHERE parseddata->>:key ILIKE '%' || :value || '%'",
            nativeQuery = true)
    List<Rawline> findByParseddataKeyContainingValue(@Param("key") String key, @Param("value") String value);

    // Count by source device
    @Query("SELECT r.sourcedeviceid.id, COUNT(r) FROM Rawline r WHERE r.sourcedeviceid IS NOT NULL GROUP BY r.sourcedeviceid.id")
    List<Object[]> countBySourceDevice();

    // Count by destination device
    @Query("SELECT r.destinationdeviceid.id, COUNT(r) FROM Rawline r WHERE r.destinationdeviceid IS NOT NULL GROUP BY r.destinationdeviceid.id")
    List<Object[]> countByDestinationDevice();

    // Count by action
    @Query("SELECT r.action.action, COUNT(r) FROM Rawline r WHERE r.action IS NOT NULL GROUP BY r.action.action")
    List<Object[]> countByAction();

    // Combined search across multiple fields
    @Query("SELECT r FROM Rawline r WHERE " +
            "(:sourceDeviceId IS NULL OR r.sourcedeviceid.id = :sourceDeviceId) AND " +
            "(:destDeviceId IS NULL OR r.destinationdeviceid.id = :destDeviceId) AND " +
            "(:sourcePort IS NULL OR r.sourceport = :sourcePort) AND " +
            "(:destPort IS NULL OR r.destinationport = :destPort) AND " +
            "(:actionId IS NULL OR r.action.action = :actionId) AND " +
            "(:messageText IS NULL OR LOWER(r.message) LIKE LOWER(CONCAT('%', :messageText, '%')))")
    List<Rawline> advancedSearch(
            @Param("sourceDeviceId") Integer sourceDeviceId,
            @Param("destDeviceId") Integer destDeviceId,
            @Param("sourcePort") Integer sourcePort,
            @Param("destPort") Integer destPort,
            @Param("actionId") String actionId,
            @Param("messageText") String messageText);

    @Query(nativeQuery = true, value =
            "SELECT d.deviceid, d.hostname, d.ipaddress, d.location, " +
                    "COUNT(r.rawline) AS event_count " +
                    "FROM device d " +
                    "JOIN rawline r ON d.deviceid = r.sourcedeviceid " +
                    "WHERE d.deviceid IN (" +
                    "    SELECT sourcedeviceid FROM rawline " +
                    "    GROUP BY sourcedeviceid " +
                    "    HAVING COUNT(*) > (" +
                    "        SELECT AVG(event_count) FROM (" +
                    "            SELECT COUNT(*) AS event_count FROM rawline " +
                    "            WHERE sourcedeviceid IS NOT NULL " +
                    "            GROUP BY sourcedeviceid" +
                    "        ) AS counts" +
                    "    )" +
                    ") " +
                    "GROUP BY d.deviceid, d.hostname, d.ipaddress, d.location " +
                    "ORDER BY event_count DESC")
    List<Object[]> getHighTrafficSourceDevices();
}