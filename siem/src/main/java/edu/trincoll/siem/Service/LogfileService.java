package edu.trincoll.siem.Service;

import com.google.gson.Gson;
import edu.trincoll.siem.Model.Enums.LogFileStatus;
import edu.trincoll.siem.Model.Logevent;
import edu.trincoll.siem.Model.Logfile;
import edu.trincoll.siem.Model.Rawline;
import edu.trincoll.siem.Repository.LogfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.util.Locale;
import org.springframework.transaction.annotation.Transactional;
import edu.trincoll.siem.Model.Device;
import edu.trincoll.siem.Model.Action;

@Service
public class LogfileService {

    private final LogfileRepository logfileRepository;
    private final RawlineService rawlineService;
    private final LogeventService logeventService;
    private final ActionService actionService;
    private final DeviceService deviceService;

    @Autowired  // This annotation is optional on a single constructor
    public LogfileService(LogfileRepository logfileRepository,
                          LogeventService logeventService,
                          RawlineService rawlineService,
                          ActionService actionService,
                          DeviceService deviceService) {
        this.logfileRepository = logfileRepository;
        this.logeventService = logeventService;
        this.rawlineService = rawlineService;
        this.actionService = actionService;
        this.deviceService = deviceService;
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

    /**
     * Process a newly uploaded log file by parsing each line and creating log events
     *
     * @param logfile The newly uploaded log file
     * @return The updated log file with processed status
     */
    @Transactional
    public Logfile processLogfileContent(Logfile logfile) {
        if (logfile.getRawcontent() == null || logfile.getRawcontent().isEmpty()) {
            logfile.setStatus(LogFileStatus.Failed);
            return saveLogfile(logfile);
        }

        try {
            // Split the content into lines
            String[] lines = logfile.getRawcontent().split("\\r?\\n");

            for (String line : lines) {
                if (line.trim().isEmpty()) {
                    continue; // Skip empty lines
                }

                // Create a raw line entry first
                Rawline rawline = parseAndCreateRawline(line);

                // Create a log event that references the raw line and log file
                Logevent logevent = new Logevent();
                logevent.setFileid(logfile);
                logevent.setRawline(rawline);

                // Try to extract timestamp from the line
                Instant timestamp = extractTimestampFromLine(line);
                logevent.setTimestamp(timestamp != null ? timestamp : Instant.now());

                // Save the log event
                logeventService.saveEvent(logevent);
            }

            // Update log file status to Uploaded after successful processing
            logfile.setStatus(LogFileStatus.Uploaded);
            return saveLogfile(logfile);

        } catch (Exception e) {
            logfile.setStatus(LogFileStatus.Failed);
            return saveLogfile(logfile);
        }
    }

    /**
     * Parse a log line and create a raw line entry
     */
    private Rawline parseAndCreateRawline(String line) {
        Rawline rawline = new Rawline();
        rawline.setRawline(line);
        rawline.setMessage(line); // Default message is the whole line

        // Parse data from the line
        parseLogLine(rawline, line);

        // Save and return the raw line
        return rawlineService.saveRawline(rawline);
    }

    /**
     * Extract structured data from a log line
     */
    private void parseLogLine(Rawline rawline, String line) {
        // Extract timestamp and hostname/source
        Matcher timestampHostnameMatch = Pattern.compile("^(\\w{3}\\s+\\d{1,2}\\s+\\d{2}:\\d{2}:\\d{2})\\s+([^:]+):").matcher(line);
        if (timestampHostnameMatch.find()) {
            // No direct way to set hostname, but could be stored in parsed data
            JsonObject hostnameData = new JsonObject();
            hostnameData.addProperty("timestamp", timestampHostnameMatch.group(1));
            hostnameData.addProperty("hostname", timestampHostnameMatch.group(2));

            // Find the source device by hostname
            Optional<Device> sourceDeviceOpt = deviceService.getDeviceByHostname(timestampHostnameMatch.group(2));
            if (sourceDeviceOpt.isPresent()) {
                Device sourceDevice = sourceDeviceOpt.get();
                rawline.setSourcedeviceid(sourceDevice);
            }

            Gson gson = new Gson();
            Map<String, Object> dataMap = gson.fromJson(hostnameData.toString(), Map.class);
            rawline.setParseddata(dataMap);
        }

        // Parse login failures
        Matcher loginMatch = Pattern.compile("User\\s+(\\S+)\\s+failed\\s+login\\s+attempt").matcher(line);
        if (loginMatch.find()) {
            // Set action to LOGIN_FAILED
            Action action = actionService.getActionByName("LOGIN_FAILED")
                    .orElseGet(() -> {
                        Action newAction = new Action();
                        newAction.setAction("LOGIN_FAILED");
                        return actionService.saveAction(newAction);
                    });

            rawline.setAction(action);
            rawline.setMessage("Failed login attempt for user " + loginMatch.group(1));

            // Extract reason if available
            Matcher reasonMatch = Pattern.compile("Reason:\\s+(.+?)(?:$|-)").matcher(line);
            if (reasonMatch.find()) {
                // Get current parseddata as Map if it exists
                Map<String, Object> currentDataMap = rawline.getParseddata();

                // If null, create a new map
                if (currentDataMap == null) {
                    currentDataMap = new java.util.HashMap<>();
                }

                // Add the new properties to the map
                currentDataMap.put("username", loginMatch.group(1));
                currentDataMap.put("failureReason", reasonMatch.group(1).trim());

                // Set the updated map back to rawline
                rawline.setParseddata(currentDataMap);
            }
        }

        // Check for connection patterns
        Matcher connectionMatch = Pattern.compile("Connection from (\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})(?::(\\d+))? to (\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})(?::(\\d+))?").matcher(line);
        if (connectionMatch.find()) {
            try {
                // Find source device by IP
                InetAddress sourceIpAddress = InetAddress.getByName(connectionMatch.group(1));
                Optional<Device> sourceDeviceOpt = deviceService.getDeviceByIpAddress(sourceIpAddress);
                if (sourceDeviceOpt.isPresent()) {
                    Device sourceDevice = sourceDeviceOpt.get();
                    rawline.setSourcedeviceid(sourceDevice);
                }

                // Find destination device by IP
                InetAddress destIpAddress = InetAddress.getByName(connectionMatch.group(3));
                Optional<Device> destDeviceOpt = deviceService.getDeviceByIpAddress(destIpAddress);
                if (destDeviceOpt.isPresent()) {
                    Device destDevice = destDeviceOpt.get();
                    rawline.setDestinationdeviceid(destDevice);
                }

                // Set ports if present
                if (connectionMatch.group(2) != null) {
                    rawline.setSourceport(Integer.parseInt(connectionMatch.group(2)));
                }

                if (connectionMatch.group(4) != null) {
                    rawline.setDestinationport(Integer.parseInt(connectionMatch.group(4)));
                }

                // Set CONNECTION action
                Action action = actionService.getActionByName("CONNECTION")
                        .orElseGet(() -> {
                            Action newAction = new Action();
                            newAction.setAction("CONNECTION");
                            return actionService.saveAction(newAction);
                        });

                rawline.setAction(action);
                rawline.setMessage("Connection from " + connectionMatch.group(1) +
                        (connectionMatch.group(2) != null ? ":" + connectionMatch.group(2) : "") +
                        " to " + connectionMatch.group(3) +
                        (connectionMatch.group(4) != null ? ":" + connectionMatch.group(4) : ""));
            } catch (UnknownHostException e) {
                // Log the error but continue processing
                System.err.println("Invalid IP address format in connection pattern: " +
                        connectionMatch.group(1) + " or " + connectionMatch.group(3));

                // Still process what we can
                // Set ports if present
                if (connectionMatch.group(2) != null) {
                    rawline.setSourceport(Integer.parseInt(connectionMatch.group(2)));
                }

                if (connectionMatch.group(4) != null) {
                    rawline.setDestinationport(Integer.parseInt(connectionMatch.group(4)));
                }

                // Set CONNECTION action
                Action action = actionService.getActionByName("CONNECTION")
                        .orElseGet(() -> {
                            Action newAction = new Action();
                            newAction.setAction("CONNECTION");
                            return actionService.saveAction(newAction);
                        });

                rawline.setAction(action);
                rawline.setMessage("Connection from " + connectionMatch.group(1) +
                        (connectionMatch.group(2) != null ? ":" + connectionMatch.group(2) : "") +
                        " to " + connectionMatch.group(3) +
                        (connectionMatch.group(4) != null ? ":" + connectionMatch.group(4) : ""));
            }
        }

        // Look for HTTP requests
        Matcher httpMatch = Pattern.compile("(GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH)\\s+(\\S+)\\s+-\\s+(\\d{3})").matcher(line);
        if (httpMatch.find()) {
            // Set action to HTTP method
            Action action = actionService.getActionByName(httpMatch.group(1))
                    .orElseGet(() -> {
                        Action newAction = new Action();
                        newAction.setAction(httpMatch.group(1));
                        return actionService.saveAction(newAction);
                    });

            rawline.setAction(action);

            // Get current parseddata as Map if it exists
            Map<String, Object> currentDataMap = rawline.getParseddata();

            // If null, create a new map
            if (currentDataMap == null) {
                currentDataMap = new java.util.HashMap<>();
            }

            // Add the new properties to the map
            currentDataMap.put("url", httpMatch.group(2));
            currentDataMap.put("statusCode", httpMatch.group(3));

            // Set the updated map back to rawline
            rawline.setParseddata(currentDataMap);

            rawline.setMessage("HTTP " + httpMatch.group(1) + " request to " +
                    httpMatch.group(2) + " returned " + httpMatch.group(3));
        }

        // Look for source IP addresses
        Matcher sourceIpMatch = Pattern.compile("Source IP:\\s+(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})(?::(\\d+))?").matcher(line);
        if (sourceIpMatch.find()) {
            try {
                // Find source device by IP
                InetAddress ipAddress = InetAddress.getByName(sourceIpMatch.group(1));
                Optional<Device> sourceDeviceOpt = deviceService.getDeviceByIpAddress(ipAddress);
                if (sourceDeviceOpt.isPresent()) {
                    Device sourceDevice = sourceDeviceOpt.get();
                    rawline.setSourcedeviceid(sourceDevice);
                }

                if (sourceIpMatch.group(2) != null) {
                    rawline.setSourceport(Integer.parseInt(sourceIpMatch.group(2)));
                }

                // Get current parseddata as Map if it exists
                Map<String, Object> currentDataMap = rawline.getParseddata();

                // If null, create a new map
                if (currentDataMap == null) {
                    currentDataMap = new java.util.HashMap<>();
                }

                // Add the new property to the map
                currentDataMap.put("sourceIp", sourceIpMatch.group(1));

                // Set the updated map back to rawline
                rawline.setParseddata(currentDataMap);
            } catch (UnknownHostException e) {
                // Log the error but continue processing
                System.err.println("Invalid IP address format: " + sourceIpMatch.group(1));

                // Still process the port and add to parsed data even if IP address is invalid
                if (sourceIpMatch.group(2) != null) {
                    rawline.setSourceport(Integer.parseInt(sourceIpMatch.group(2)));
                }

                // Get current parseddata as Map if it exists
                Map<String, Object> currentDataMap = rawline.getParseddata();

                // If null, create a new map
                if (currentDataMap == null) {
                    currentDataMap = new java.util.HashMap<>();
                }

                // Add the IP as a string even if it's invalid format
                currentDataMap.put("sourceIp", sourceIpMatch.group(1));

                // Set the updated map back to rawline
                rawline.setParseddata(currentDataMap);
            }
        }

        // Look for destination IP addresses
        Matcher destIpMatch = Pattern.compile("Destination IP:\\s+(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})(?::(\\d+))?").matcher(line);
        if (destIpMatch.find()) {
            try {
                // Find destination device by IP
                InetAddress ipAddress = InetAddress.getByName(destIpMatch.group(1));
                Optional<Device> destDeviceOpt = deviceService.getDeviceByIpAddress(ipAddress);
                if (destDeviceOpt.isPresent()) {
                    Device destDevice = destDeviceOpt.get();
                    rawline.setDestinationdeviceid(destDevice);
                }

                if (destIpMatch.group(2) != null) {
                    rawline.setDestinationport(Integer.parseInt(destIpMatch.group(2)));
                }

                // Get current parseddata as Map if it exists
                Map<String, Object> currentDataMap = rawline.getParseddata();

                // If null, create a new map
                if (currentDataMap == null) {
                    currentDataMap = new java.util.HashMap<>();
                }

                // Add the new property to the map
                currentDataMap.put("destinationIp", destIpMatch.group(1));

                // Set the updated map back to rawline
                rawline.setParseddata(currentDataMap);
            } catch (UnknownHostException e) {
                // Log the error but continue processing
                System.err.println("Invalid IP address format: " + destIpMatch.group(1));

                // Still process the rest of the data even if IP address is invalid
                if (destIpMatch.group(2) != null) {
                    rawline.setDestinationport(Integer.parseInt(destIpMatch.group(2)));
                }

                // Get current parseddata as Map if it exists
                Map<String, Object> currentDataMap = rawline.getParseddata();

                // If null, create a new map
                if (currentDataMap == null) {
                    currentDataMap = new java.util.HashMap<>();
                }

                // Add the IP as a string even if it's invalid format
                currentDataMap.put("destinationIp", destIpMatch.group(1));

                // Set the updated map back to rawline
                rawline.setParseddata(currentDataMap);
            }
        }
    }

    /**
     * Extract timestamp from a log line
     */
    private Instant extractTimestampFromLine(String line) {
        try {
            // Look for timestamp pattern like "Apr 17 09:23:41"
            Matcher matcher = Pattern.compile("^(\\w{3}\\s+\\d{1,2}\\s+\\d{2}:\\d{2}:\\d{2})").matcher(line);
            if (matcher.find()) {
                String timestamp = matcher.group(1);
                // Add current year as the timestamp doesn't include year
                int currentYear = LocalDate.now().getYear();
                String fullTimestamp = timestamp + " " + currentYear;

                // Parse the timestamp
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd HH:mm:ss yyyy", Locale.ENGLISH);
                LocalDateTime localDateTime = LocalDateTime.parse(fullTimestamp, formatter);

                return localDateTime.atZone(ZoneId.systemDefault()).toInstant();
            }
        } catch (Exception e) {
            // If parsing fails, return null and caller will use current time
        }
        return null;
    }
}