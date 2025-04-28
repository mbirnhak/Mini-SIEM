package edu.trincoll.siem.Model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Getter
@Setter
@Entity
@Table(name = "incidenteventlink")
public class Incidenteventlink {
    @EmbeddedId
    private IncidenteventlinkId id;

    @MapsId("reportid")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "reportid", nullable = false)
    private Incidentreport reportid;

    @MapsId("logeventid")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "logeventid", nullable = false)
    private Logevent logeventid;

}