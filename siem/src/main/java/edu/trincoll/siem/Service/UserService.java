package edu.trincoll.siem.Service;

import org.springframework.security.crypto.bcrypt.BCrypt;
import edu.trincoll.siem.Model.User;
import edu.trincoll.siem.Model.Enums.Role;
import edu.trincoll.siem.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Authenticate a user by username and password.
     * @param username The username to authenticate.
     * @param password The plain password entered by the user.
     * @return The authenticated User if credentials are valid, null otherwise.
     */
    public User authenticateUser(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Use PostgreSQL's crypt function to verify the password.
            String hashedPassword = user.getPasswordHash();
            boolean isPasswordValid = checkPassword(password, hashedPassword);
            if (isPasswordValid) {
                return user;
            }
        }
        return null; // Invalid credentials
    }

    /**
     * Compares the plain password with the hashed password.
     * @param plainPassword The plain password.
     * @param hashedPassword The hashed password from the database.
     * @return true if passwords match, false otherwise.
     */
    private boolean checkPassword(String plainPassword, String hashedPassword) {
        // PostgreSQL 'crypt' function for verifying the password.
        return BCrypt.checkpw(plainPassword, hashedPassword);
    }


    /**
     * Find all users in the system
     * @return List of all users
     */
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Find user by ID
     * @param id User ID
     * @return Optional containing user if found
     */
    public Optional<User> findUserById(Integer id) {
        return userRepository.findById(id);
    }

    /**
     * Find user by username
     * @param username Username to search for
     * @return Optional containing user if found
     */
    public Optional<User> findUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Find user by email
     * @param email Email to search for
     * @return Optional containing user if found
     */
    public Optional<User> findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Find all users with a specific role
     * @param role Role to filter by
     * @return List of users with the specified role
     */
    public List<User> findUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    /**
     * Find users who haven't logged in since a specific time
     * @param cutoffTime Time threshold for inactivity
     * @return List of inactive users
     */
    public List<User> findInactiveUsers(Instant cutoffTime) {
        return userRepository.findByLastloginBefore(cutoffTime);
    }

    /**
     * Find new users who have never logged in
     * @param createdAfter Filter for users created after this time
     * @return List of new users who never logged in
     */
    public List<User> findNewUsersWhoNeverLoggedIn(Instant createdAfter) {
        return userRepository.findNewUsersWhoNeverLoggedIn(createdAfter);
    }

    public User createUser(String Name, String email, String username, String password, Role role) {
        if (userRepository.findByUsername(username).isPresent() || userRepository.findByEmail(email).isPresent()) {
            // Username and email must be unique
            return null;
        }
        User user = new User();
        user.setUsername(username);
        user.setName(Name);
        user.setEmail(email);
        user.setPasswordHash(password);
        user.setRole(role);
        return userRepository.save(user);
    }

    /**
     * Save or update a user
     * @param user User to save or update
     * @return Saved user with updated information
     */
    @Transactional
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    /**
     * Delete a user by ID
     * @param id ID of the user to delete
     */
    @Transactional
    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }

    /**
     * Check if username already exists
     * @param username Username to check
     * @return true if username exists, false otherwise
     */
    public boolean existsByUsername(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    /**
     * Check if email already exists
     * @param email Email to check
     * @return true if email exists, false otherwise
     */
    public boolean existsByEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    /**
     * Update user's last login time
     * @param userId User ID
     */
    @Transactional
    public void updateLastLogin(Integer userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        userOpt.ifPresent(user -> {
            user.setLastlogin(Instant.now());
            userRepository.save(user);
        });
    }
}