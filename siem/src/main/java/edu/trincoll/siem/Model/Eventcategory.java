package edu.trincoll.siem.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "eventcategory")
public class Eventcategory {
    @Id
    @Column(name = "categoryname", nullable = false, length = 100)
    private String categoryname;

    @Column(name = "description", length = Integer.MAX_VALUE)
    private String description;

}