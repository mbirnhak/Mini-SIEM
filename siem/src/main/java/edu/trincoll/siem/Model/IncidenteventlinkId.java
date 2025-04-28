package edu.trincoll.siem.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.util.Objects;

@Getter
@Setter
@Embeddable
public class IncidenteventlinkId implements java.io.Serializable {
    private static final long serialVersionUID = 6365080687070258490L;
    @Column(name = "reportid", nullable = false)
    private Integer reportid;

    @Column(name = "logeventid", nullable = false)
    private Integer logeventid;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        IncidenteventlinkId entity = (IncidenteventlinkId) o;
        return Objects.equals(this.reportid, entity.reportid) &&
                Objects.equals(this.logeventid, entity.logeventid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(reportid, logeventid);
    }

}