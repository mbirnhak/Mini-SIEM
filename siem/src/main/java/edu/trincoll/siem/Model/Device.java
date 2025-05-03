package edu.trincoll.siem.Model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.net.InetAddress;

@Getter
@Setter
@Entity
@Table(name = "device")
public class Device {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "deviceid", nullable = false)
    private Integer id;

    @Column(name = "ipaddress")
    private InetAddress ipaddress;

    @Column(name = "hostname", length = 100)
    private String hostname;

    @Column(name = "operatingsystem", length = 100)
    private String operatingsystem;

    @Column(name = "location", length = 100)
    private String location;

    @Column(name = "devicetype", length = 100)
    private String devicetype;

}