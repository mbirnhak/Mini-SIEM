package edu.trincoll.siem.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import edu.trincoll.siem.Model.Enums.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "\"user\"")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "userid", nullable = false)
    private Integer id;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "email", nullable = false, length = 100)
    private String email;

    @Column(name = "username", nullable = false, length = 50)
    private String username;

    @JsonIgnore // This annotation prevents the field from being included in JSON responses
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 50)
    private Role role;

    @Column(name = "createdat", updatable = false, insertable = false)
    @ColumnDefault("CURRENT_TIMESTAMP")
    private Instant createdat;

    @Column(name = "lastlogin")
    private Instant lastlogin;

}