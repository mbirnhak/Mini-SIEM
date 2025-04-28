package edu.trincoll.siem.Repository;

import edu.trincoll.siem.Model.Action;
import edu.trincoll.siem.Model.Eventcategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActionRepository extends JpaRepository<Action, String> {
    // Find all actions belonging to a specific category
    List<Action> findByCategoryname(Eventcategory category);

    // Find actions where category is null
    List<Action> findByCategorynameIsNull();

    // Find actions by action name containing a specific string (case-insensitive)
    List<Action> findByActionContainingIgnoreCase(String actionSubstring);

    // Count actions by category
    @Query("SELECT a.categoryname.categoryname, COUNT(a) FROM Action a GROUP BY a.categoryname.categoryname")
    List<Object[]> countActionsByCategory();
}