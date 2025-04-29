package edu.trincoll.siem.Repository;

import edu.trincoll.siem.Model.Logfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LogfileRepository extends JpaRepository<Logfile, Integer> {
}