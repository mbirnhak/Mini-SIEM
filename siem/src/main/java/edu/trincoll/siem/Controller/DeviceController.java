package edu.trincoll.siem.Controller;

import edu.trincoll.siem.Model.Device;
import edu.trincoll.siem.Service.DeviceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/devices")
public class DeviceController {

    private static final Logger logger = LoggerFactory.getLogger(DeviceController.class);

    @Autowired
    private DeviceService deviceService;

    @GetMapping
    public List<Device> getAllDevices() {
        return deviceService.getAllDevices();
    }

    @GetMapping("/{id}")
    public Optional<Device> getDeviceById(@PathVariable Integer id) {
        return deviceService.getDeviceById(id);
    }

    @GetMapping("/ip")
    public ResponseEntity<Device> getDeviceByIpAddress(@RequestParam String ip) {
        try {
            InetAddress ipAddress = InetAddress.getByName(ip);
            Optional<Device> device = deviceService.getDeviceByIpAddress(ipAddress);

            return device.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (UnknownHostException e) {
            // Log the error
            logger.warn("Invalid IP address format: {}", ip);
            // Return 400 Bad Request instead of throwing an exception
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/hostname")
    public Optional<Device> getDeviceByHostname(@RequestParam String hostname) {
        return deviceService.getDeviceByHostname(hostname);
    }

    @GetMapping("/search")
    public List<Device> searchDevices(@RequestParam String query) {
        return deviceService.searchDevices(query);
    }

    @GetMapping("/os")
    public List<Device> getDevicesByOperatingSystem(@RequestParam String os) {
        return deviceService.getDevicesByOperatingSystem(os);
    }

    @GetMapping("/location")
    public List<Device> getDevicesByLocation(@RequestParam String location) {
        return deviceService.getDevicesByLocation(location);
    }

    @GetMapping("/type")
    public List<Device> getDevicesByDeviceType(@RequestParam String type) {
        return deviceService.getDevicesByDeviceType(type);
    }

    @GetMapping("/subnet")
    public List<Device> getDevicesBySubnet(@RequestParam String subnet) {
        return deviceService.getDevicesBySubnet(subnet);
    }

    @GetMapping("/count/os")
    public List<Object[]> countByOperatingSystem() {
        return deviceService.countDevicesByOperatingSystem();
    }

    @GetMapping("/count/location")
    public List<Object[]> countByLocation() {
        return deviceService.countDevicesByLocation();
    }

    @GetMapping("/count/type")
    public List<Object[]> countByDeviceType() {
        return deviceService.countDevicesByDeviceType();
    }

    @GetMapping("/filter")
    public List<Device> getDevicesByLocationAndType(@RequestParam String location, @RequestParam String type) {
        return deviceService.getDevicesByLocationAndType(location, type);
    }

    @PostMapping
    public Device createDevice(@RequestBody Device device) {
        return deviceService.saveDevice(device);
    }

    @DeleteMapping("/{id}")
    public void deleteDevice(@PathVariable Integer id) {
        deviceService.deleteDeviceById(id);
    }
}