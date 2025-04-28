package edu.trincoll.siem.Model;

import edu.trincoll.siem.Model.Enums.AlertStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "alert")
public class Alert {
    @Id
    @ColumnDefault("nextval('alert_alertid_seq')")
    @Column(name = "alertid", nullable = false)
    private Integer id;

    @Column(name = "triggeredat")
    private Instant triggeredat;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "ruleid", nullable = false)
    private Alertrule ruleid;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private AlertStatus status;
}
