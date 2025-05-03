package edu.trincoll.siem.Model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.type.SqlTypes;

import java.util.Map;

@Getter
@Setter
@Entity
@Table(name = "rawline")
public class Rawline {
    @Id
    @Column(name = "rawline", nullable = false, length = Integer.MAX_VALUE)
    private String rawline;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "sourcedeviceid")
    private Device sourcedeviceid;

    @Column(name = "sourceport")
    private Integer sourceport;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "destinationdeviceid")
    private Device destinationdeviceid;

    @Column(name = "destinationport")
    private Integer destinationport;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "action")
    private Action action;

    @Column(name = "message", length = Integer.MAX_VALUE)
    private String message;

    @Column(name = "parseddata")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> parseddata;

    @Transient
    private String searchVector;

}