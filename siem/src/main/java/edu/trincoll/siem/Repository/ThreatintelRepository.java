package edu.trincoll.siem.Repository;

import edu.trincoll.siem.Model.Enums.Severity;
import edu.trincoll.siem.Model.Threatintel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ThreatintelRepository extends JpaRepository<Threatintel, Integer> {
    // Find by indicator (exact match)
    Optional<Threatintel> findByIndicator(String indicator);

    // Find by indicator containing a string (case-insensitive)
    List<Threatintel> findByIndicatorContainingIgnoreCase(String indicatorSubstring);

    // Find by type (exact match)
    List<Threatintel> findByType(String type);

    // Find by type containing a string (case-insensitive)
    List<Threatintel> findByTypeContainingIgnoreCase(String typeSubstring);

    // Find by severity
    List<Threatintel> findBySeverity(Severity severity);

    // Find by description containing a string (case-insensitive)
    List<Threatintel> findByDescriptionContainingIgnoreCase(String descriptionSubstring);

    // Find by type and severity
    List<Threatintel> findByTypeAndSeverity(String type, Severity severity);

    // Find by indicator pattern (using SQL LIKE)
    @Query("SELECT t FROM Threatintel t WHERE t.indicator LIKE :pattern")
    List<Threatintel> findByIndicatorPattern(@Param("pattern") String pattern);

    // Check if an indicator exists
    boolean existsByIndicator(String indicator);

    // Count threats by type
    @Query("SELECT t.type, COUNT(t) FROM Threatintel t GROUP BY t.type")
    List<Object[]> countByType();

    // Count threats by severity
    @Query("SELECT t.severity, COUNT(t) FROM Threatintel t GROUP BY t.severity")
    List<Object[]> countBySeverity();

    // Search across multiple fields
    @Query("SELECT t FROM Threatintel t WHERE " +
            "LOWER(t.indicator) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(t.type) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(t.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Threatintel> searchThreats(@Param("searchTerm") String searchTerm);

    // Find threats by severity ordered by indicator
    List<Threatintel> findBySeverityOrderByIndicatorAsc(Severity severity);

    // Advanced search with multiple optional criteria
    @Query("SELECT t FROM Threatintel t WHERE " +
            "(:type IS NULL OR t.type = :type) AND " +
            "(:severity IS NULL OR t.severity = :severity) AND " +
            "(:indicatorTerm IS NULL OR LOWER(t.indicator) LIKE LOWER(CONCAT('%', :indicatorTerm, '%')))")
    List<Threatintel> advancedSearch(
            @Param("type") String type,
            @Param("severity") Severity severity,
            @Param("indicatorTerm") String indicatorTerm);

    // Find all distinct threat types
    @Query("SELECT DISTINCT t.type FROM Threatintel t ORDER BY t.type")
    List<String> findAllDistinctTypes();

    // Find top threats by severity (most severe first)
    @Query("SELECT t FROM Threatintel t ORDER BY " +
            "CASE t.severity " +
            "WHEN edu.trincoll.siem.Model.Enums.Severity.HIGH THEN 1 " +
            "WHEN edu.trincoll.siem.Model.Enums.Severity.MEDIUM THEN 2 " +
            "WHEN edu.trincoll.siem.Model.Enums.Severity.LOW THEN 3 " +
            "ELSE 4 END")
    List<Threatintel> findTopThreats(org.springframework.data.domain.Pageable pageable);
}