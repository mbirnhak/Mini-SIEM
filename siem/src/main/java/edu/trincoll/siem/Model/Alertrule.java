package edu.trincoll.siem.Model;

import edu.trincoll.siem.Model.Enums.Severity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;

@Getter
@Setter
@Entity
@Table(name = "alertrule")
public class Alertrule {
    @Id
    @ColumnDefault("nextval('alertrule_ruleid_seq')")
    @Column(name = "ruleid", nullable = false)
    private Integer id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = Integer.MAX_VALUE)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 50)
    private Severity severity;

    @Column(name = "conditionlogic", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> conditionlogic;

    @Column(name = "isactive", nullable = false)
    private Boolean isactive = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "createdby")
    private User createdby;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "createdat")
    private Instant createdat;

}