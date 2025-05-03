package edu.trincoll.siem.Service;

import edu.trincoll.siem.Model.Device;
import edu.trincoll.siem.Repository.DeviceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.InetAddress;
import java.util.List;
import java.util.Optional;

@Service
public class DeviceService {

    @Autowired
    private DeviceRepository deviceRepository;

    public Optional<Device> getDeviceByIpAddress(InetAddress ipAddress) {
        List<Device> devices = deviceRepository.findByIpaddress(ipAddress);
        if (devices.isEmpty()) {
            return Optional.empty();
        }
        // Return the first device found
        return Optional.of(devices.getFirst());
    }

    public Optional<Device> getDeviceByHostname(String hostname) {
        return deviceRepository.findByHostname(hostname);
    }

    public List<Device> searchDevices(String searchTerm) {
        return deviceRepository.searchDevices(searchTerm);
    }

    public List<Device> getDevicesByOperatingSystem(String os) {
        return deviceRepository.findByOperatingsystem(os);
    }

    public List<Device> getDevicesByLocation(String location) {
        return deviceRepository.findByLocation(location);
    }

    public List<Device> getDevicesByDeviceType(String deviceType) {
        return deviceRepository.findByDevicetype(deviceType);
    }

    public List<Device> getDevicesBySubnet(String subnet) {
        return deviceRepository.findByIpaddressInSubnet(subnet);
    }

    public List<Object[]> countDevicesByOperatingSystem() {
        return deviceRepository.countDevicesByOperatingSystem();
    }

    public List<Object[]> countDevicesByLocation() {
        return deviceRepository.countDevicesByLocation();
    }

    public List<Object[]> countDevicesByDeviceType() {
        return deviceRepository.countDevicesByDeviceType();
    }

    public List<Device> getDevicesByLocationAndType(String location, String deviceType) {
        return deviceRepository.findByLocationAndDevicetype(location, deviceType);
    }

    public Device saveDevice(Device device) {
        return deviceRepository.save(device);
    }

    public void deleteDeviceById(Integer id) {
        deviceRepository.deleteById(id);
    }

    public List<Device> getAllDevices() {
        return deviceRepository.findAll();
    }

    public Optional<Device> getDeviceById(Integer id) {
        return deviceRepository.findById(id);
    }
}