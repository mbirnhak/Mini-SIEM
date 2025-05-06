package edu.trincoll.siem.Service;

import edu.trincoll.siem.Model.Alert;
import edu.trincoll.siem.Model.Logfile;
import edu.trincoll.siem.Model.Logevent;
import edu.trincoll.siem.Model.Rawline;
import edu.trincoll.siem.Repository.LogeventRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class LogeventService {

    private final LogeventRepository logeventRepository;

    public LogeventService(LogeventRepository logeventRepository) {
        this.logeventRepository = logeventRepository;
    }

    // Basic CRUD operations
    public List<Logevent> getAllEvents() {
        return logeventRepository.findAll();
    }

    public Optional<Logevent> getEventById(Integer id) {
        return logeventRepository.findById(id);
    }

    public Logevent saveEvent(Logevent event) {
        return logeventRepository.save(event);
    }

    public void deleteEvent(Integer id) {
        logeventRepository.deleteById(id);
    }

    // Find by file
    public List<Logevent> getEventsByFile(Logfile file) {
        return logeventRepository.findByFileid(file);
    }

    // Find by raw line
    public List<Logevent> getEventsByRawline(Rawline rawLine) {
        return logeventRepository.findByRawline(rawLine);
    }

    // Find by alert
    public List<Logevent> getEventsByAlert(Alert alert) {
        return logeventRepository.findByAssociatedalertid(alert);
    }

    // Find events with no alert
    public List<Logevent> getEventsWithNoAlert() {
        return logeventRepository.findByAssociatedalertidIsNull();
    }

    // Find events in time range
    public List<Logevent> getEventsBetween(Instant startTime, Instant endTime) {
        return logeventRepository.findByTimestampBetween(startTime, endTime);
    }

    // Get the latest events
    public List<Logevent> getLatestEvents(int limit) {
        return logeventRepository.findLatestEvents(PageRequest.of(0, limit));
    }

    // Get events count over time (for visualization)
    public List<Object[]> getEventCountTimeSeries(Instant startTime, Instant endTime) {
        return logeventRepository.getEventCountTimeSeries(startTime, endTime);
    }

    // Count events by file
    public List<Object[]> countEventsByFile() {
        return logeventRepository.countEventsByFile();
    }

    public List<Object[]> getEventCountFromMaterializedView(Instant startTime, Instant endTime) {
        return logeventRepository.getLogEventCountPerHour(startTime, endTime);
    }

    public List<Object[]> getComplexEventReport() {
        return logeventRepository.getComplexEventReport();
    }
}