package edu.trincoll.siem.Model;

import edu.trincoll.siem.Model.Enums.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "\"User\"")
public class User {
    @Id
    @Column(name = "userid", nullable = false)
    private Integer id;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "email", nullable = false, length = 100)
    private String email;

    @Column(name = "username", nullable = false, length = 50)
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 50)
    private Role role;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "createdat")
    private Instant createdat;

    @Column(name = "lastlogin")
    private Instant lastlogin;

}