package edu.trincoll.siem.Model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Getter
@Setter
@Entity
@Table(name = "action")
public class Action {
    @Id
    @Column(name = "action", nullable = false, length = 100)
    private String action;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "categoryname")
    private Eventcategory categoryname;

}