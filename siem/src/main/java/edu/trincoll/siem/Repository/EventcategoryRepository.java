package edu.trincoll.siem.Repository;

import edu.trincoll.siem.Model.Eventcategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventcategoryRepository extends JpaRepository<Eventcategory, String> {
    // Find by categoryname (this is redundant since it's the primary key, but included for completeness)
    Optional<Eventcategory> findByCategoryname(String categoryName);

    // Find categories by name containing a string (case-insensitive)
    List<Eventcategory> findByCategorynameContainingIgnoreCase(String nameSubstring);

    // Find categories by description containing a string (case-insensitive)
    List<Eventcategory> findByDescriptionContainingIgnoreCase(String descriptionSubstring);

    // Custom search across both fields
    @Query("SELECT e FROM Eventcategory e WHERE " +
            "LOWER(e.categoryname) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(e.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Eventcategory> searchCategories(@Param("searchTerm") String searchTerm);

    // Find categories ordered by name
    @Query("SELECT e FROM Eventcategory e ORDER BY e.categoryname")
    List<Eventcategory> findAllOrderedByName();

    // Check if category exists by name
    boolean existsByCategoryname(String categoryName);
}