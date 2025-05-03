package edu.trincoll.siem.Model;

import edu.trincoll.siem.Model.Enums.LogFileStatus;
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
@Table(name = "logfile")
public class Logfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fileid", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "uploadedby")
    private User uploadedby;

    @Column(name = "sourcename", length = 100)
    private String sourcename;

    @Column(name = "sourcetype", length = 50)
    private String sourcetype;

    @Column(name = "filename", length = 100)
    private String filename;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "uploadtime")
    private Instant uploadtime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private LogFileStatus status;

    @Column(name = "rawcontent", length = Integer.MAX_VALUE)
    private String rawcontent;

}