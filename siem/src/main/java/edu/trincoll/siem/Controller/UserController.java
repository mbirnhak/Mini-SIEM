package edu.trincoll.siem.Controller;

import edu.trincoll.siem.Model.User;
import edu.trincoll.siem.Model.Enums.Role;
import edu.trincoll.siem.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        // Authenticate the user
        User authenticatedUser = userService.authenticateUser(username, password);
        if (authenticatedUser != null) {
            // Return user information if authenticated
            return ResponseEntity.ok(authenticatedUser);
        } else {
            // Return an error message if authentication fails
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.findAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        Optional<User> user = userService.findUserById(id);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        Optional<User> user = userService.findUserByUsername(username);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        Optional<User> user = userService.findUserByEmail(email);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable Role role) {
        return ResponseEntity.ok(userService.findUsersByRole(role));
    }

    @GetMapping("/inactive")
    public ResponseEntity<List<User>> getInactiveUsers(@RequestParam int inactiveDays) {
        Instant cutoffTime = Instant.now().minus(Duration.ofDays(inactiveDays));
        return ResponseEntity.ok(userService.findInactiveUsers(cutoffTime));
    }

    @GetMapping("/new-inactive")
    public ResponseEntity<List<User>> getNewInactiveUsers(@RequestParam int createdAfterDays) {
        Instant createdAfter = Instant.now().minus(Duration.ofDays(createdAfterDays));
        return ResponseEntity.ok(userService.findNewUsersWhoNeverLoggedIn(createdAfter));
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> userRequest) {
        try {
            String name = (String) userRequest.get("name");
            String email = (String) userRequest.get("email");
            String username = (String) userRequest.get("username");
            String password = (String) userRequest.get("password");
            Role role = Role.valueOf((String) userRequest.get("role"));

            // Check if username or email already exists
            if (userService.existsByUsername(username)) {
                return ResponseEntity.badRequest().body("Username already exists");
            }

            if (userService.existsByEmail(email)) {
                return ResponseEntity.badRequest().body("Email already exists");
            }

            User newUser = userService.createUser(name, email, username, password, role);
            return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating user: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @RequestBody User user) {
        if (!id.equals(user.getId())) {
            return ResponseEntity.badRequest().body("ID in path does not match ID in request body");
        }

        Optional<User> existingUser = userService.findUserById(id);
        if (existingUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Check if trying to update username or email to one that already exists
        if (!existingUser.get().getUsername().equals(user.getUsername())
                && userService.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        if (!existingUser.get().getEmail().equals(user.getEmail())
                && userService.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        User updatedUser = userService.saveUser(user);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        if (!userService.findUserById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }

        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/last-login")
    public ResponseEntity<?> updateLastLogin(@PathVariable Integer id) {
        Optional<User> user = userService.findUserById(id);
        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        userService.updateLastLogin(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check-username/{username}")
    public ResponseEntity<Boolean> checkUsernameExists(@PathVariable String username) {
        return ResponseEntity.ok(userService.existsByUsername(username));
    }

    @GetMapping("/check-email/{email}")
    public ResponseEntity<Boolean> checkEmailExists(@PathVariable String email) {
        return ResponseEntity.ok(userService.existsByEmail(email));
    }

    /**
     * Identifies users who have performed a minimum number of actions
     * Uses GROUP BY with HAVING clause
     * @param minActions Minimum number of actions to consider "active" (default: 3)
     */
    @GetMapping("/active-users")
    public ResponseEntity<List<Object[]>> getActiveUsers(
            @RequestParam(defaultValue = "3") int minActions) {
        return ResponseEntity.ok(userService.getActiveUsers(minActions));
    }
}