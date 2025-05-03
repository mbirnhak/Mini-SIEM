package edu.trincoll.siem.Repository;

import edu.trincoll.siem.Model.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.net.InetAddress;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Integer> {
    // Find device by IP address
    List<Device> findByIpaddress(InetAddress ipAddress);

    // Find device by hostname (exact match)
    Optional<Device> findByHostname(String hostname);

    // Find devices by hostname containing a string (case-insensitive)
    List<Device> findByHostnameContainingIgnoreCase(String hostnameSubstring);

    // Find devices by operating system
    List<Device> findByOperatingsystem(String operatingSystem);

    // Find devices by operating system containing a string (case-insensitive)
    List<Device> findByOperatingsystemContainingIgnoreCase(String osSubstring);

    // Find devices by location
    List<Device> findByLocation(String location);

    // Find devices by device type
    List<Device> findByDevicetype(String deviceType);

    // Find devices by device type containing a string (case-insensitive)
    List<Device> findByDevicetypeContainingIgnoreCase(String deviceTypeSubstring);

    // Find devices by IP address in a specific subnet (native query for PostgreSQL)
    @Query(value = "SELECT * FROM device WHERE ipaddress << :subnet", nativeQuery = true)
    List<Device> findByIpaddressInSubnet(@Param("subnet") String subnet);

    // Count devices by operating system
    @Query("SELECT d.operatingsystem, COUNT(d) FROM Device d GROUP BY d.operatingsystem")
    List<Object[]> countDevicesByOperatingSystem();

    // Count devices by location
    @Query("SELECT d.location, COUNT(d) FROM Device d GROUP BY d.location")
    List<Object[]> countDevicesByLocation();

    // Count devices by device type
    @Query("SELECT d.devicetype, COUNT(d) FROM Device d GROUP BY d.devicetype")
    List<Object[]> countDevicesByDeviceType();

    // Find devices by multiple criteria
    List<Device> findByLocationAndDevicetype(String location, String deviceType);

    // Search devices by any field containing the search term (custom query)
    @Query("SELECT d FROM Device d WHERE " +
            "LOWER(d.hostname) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(d.operatingsystem) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(d.location) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(d.devicetype) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Device> searchDevices(@Param("searchTerm") String searchTerm);
}