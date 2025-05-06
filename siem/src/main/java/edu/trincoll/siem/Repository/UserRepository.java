package edu.trincoll.siem.Repository;

import edu.trincoll.siem.Model.User;
import edu.trincoll.siem.Model.Enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    // Find user by username (useful for authentication)
    Optional<User> findByUsername(String username);

    // Find user by email
    Optional<User> findByEmail(String email);

    // Find all users with a specific role
    List<User> findByRole(Role role);

    // Find users who haven't logged in since a specific time
    List<User> findByLastloginBefore(Instant cutoffTime);

    // Custom query example (users who haven't logged in but were created recently)
    @Query("SELECT u FROM User u WHERE u.lastlogin IS NULL AND u.createdat > :createdAfter")
    List<User> findNewUsersWhoNeverLoggedIn(@Param("createdAfter") Instant createdAfter);

    @Query(nativeQuery = true, value =
            "SELECT u.userid, u.username, u.name, u.email, " +
                    "COUNT(DISTINCT ir.reportid) AS reports_created, " +
                    "COUNT(DISTINCT lf.fileid) AS files_uploaded, " +
                    "COUNT(DISTINCT ar.ruleid) AS rules_created " +
                    "FROM \"user\" u " +
                    "LEFT JOIN incidentreport ir ON u.userid = ir.createdby " +
                    "LEFT JOIN logfile lf ON u.userid = lf.uploadedby " +
                    "LEFT JOIN alertrule ar ON u.userid = ar.createdby " +
                    "GROUP BY u.userid, u.username, u.name, u.email " +
                    "HAVING (COUNT(DISTINCT ir.reportid) + COUNT(DISTINCT lf.fileid) + COUNT(DISTINCT ar.ruleid)) >= :minActions " +
                    "ORDER BY (COUNT(DISTINCT ir.reportid) + COUNT(DISTINCT lf.fileid) + COUNT(DISTINCT ar.ruleid)) DESC")
    List<Object[]> getActiveUsers(@Param("minActions") int minActions);
}