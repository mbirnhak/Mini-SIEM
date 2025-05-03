package edu.trincoll.siem.Model;

import edu.trincoll.siem.Model.Enums.Severity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

@Getter
@Setter
@Entity
@Table(name = "threatintel")
public class Threatintel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "threatid", nullable = false)
    private Integer id;

    @Column(name = "indicator", nullable = false, length = 100)
    private String indicator;

    @Column(name = "type", nullable = false, length = 50)
    private String type;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 50)
    private Severity severity;

    @Column(name = "description", length = Integer.MAX_VALUE)
    private String description;

}