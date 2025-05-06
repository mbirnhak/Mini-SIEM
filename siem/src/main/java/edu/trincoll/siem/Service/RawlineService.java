package edu.trincoll.siem.Service;

import edu.trincoll.siem.Model.Action;
import edu.trincoll.siem.Model.Device;
import edu.trincoll.siem.Model.Rawline;
import edu.trincoll.siem.Repository.RawlineRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RawlineService {

    private final RawlineRepository rawlineRepository;

    public RawlineService(RawlineRepository rawlineRepository) {
        this.rawlineRepository = rawlineRepository;
    }

    // Basic CRUD operations
    public List<Rawline> getAllRawlines() {
        return rawlineRepository.findAll();
    }

    public Optional<Rawline> getRawlineByContent(String rawline) {
        return rawlineRepository.findByRawline(rawline);
    }

    public Rawline saveRawline(Rawline rawline) {
        return rawlineRepository.save(rawline);
    }

    public void deleteRawline(String rawline) {
        rawlineRepository.deleteById(rawline);
    }

    // Find by source device
    public List<Rawline> getRawlinesBySourceDevice(Device sourceDevice) {
        return rawlineRepository.findBySourcedeviceid(sourceDevice);
    }

    // Find by destination device
    public List<Rawline> getRawlinesByDestinationDevice(Device destinationDevice) {
        return rawlineRepository.findByDestinationdeviceid(destinationDevice);
    }

    // Find by action
    public List<Rawline> getRawlinesByAction(Action action) {
        return rawlineRepository.findByAction(action);
    }

    // Find by message containing text
    public List<Rawline> searchRawlinesByMessage(String searchTerm) {
        return rawlineRepository.findByMessageContainingIgnoreCase(searchTerm);
    }

    // Full text search
    public List<Rawline> fullTextSearch(String searchTerms) {
        return rawlineRepository.fullTextSearchRanked(searchTerms);
    }

    // Advanced search
    public List<Rawline> advancedSearch(
            Integer sourceDeviceId,
            Integer destDeviceId,
            Integer sourcePort,
            Integer destPort,
            String actionId,
            String messageText) {
        return rawlineRepository.advancedSearch(
                sourceDeviceId, destDeviceId, sourcePort, destPort, actionId, messageText);
    }

    // Count statistics
    public List<Object[]> countBySourceDevice() {
        return rawlineRepository.countBySourceDevice();
    }

    public List<Object[]> countByDestinationDevice() {
        return rawlineRepository.countByDestinationDevice();
    }

    public List<Object[]> countByAction() {
        return rawlineRepository.countByAction();
    }

    public List<Object[]> getHighTrafficSourceDevices() {
        return rawlineRepository.getHighTrafficSourceDevices();
    }
}