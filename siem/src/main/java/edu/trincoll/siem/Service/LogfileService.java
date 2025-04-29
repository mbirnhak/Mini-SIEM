package edu.trincoll.siem.Service;

import edu.trincoll.siem.Model.Logfile;
import edu.trincoll.siem.Repository.LogfileRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LogfileService {

    // Note: LogfileRepository is not provided, so I'm creating a basic structure
    private final LogfileRepository logfileRepository;

    public LogfileService(LogfileRepository logfileRepository) {
        this.logfileRepository = logfileRepository;
    }

    // Basic CRUD operations
    public List<Logfile> getAllLogfiles() {
        return logfileRepository.findAll();
    }

    public Optional<Logfile> getLogfileById(Integer id) {
        return logfileRepository.findById(id);
    }

    public Logfile saveLogfile(Logfile logfile) {
        return logfileRepository.save(logfile);
    }

    public void deleteLogfile(Integer id) {
        logfileRepository.deleteById(id);
    }

    public boolean logfileExists(Integer id) {
        return logfileRepository.existsById(id);
    }
}