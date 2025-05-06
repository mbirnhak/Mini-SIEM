package edu.trincoll.siem.Controller;

import edu.trincoll.siem.Model.*;
import edu.trincoll.siem.Model.Enums.LogFileStatus;
import edu.trincoll.siem.Service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

// Handles: LogEvent, RawLine, LogFile, EventCategory, Action features
@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventcategoryService eventcategoryService;
    private final LogeventService logeventService;
    private final RawlineService rawlineService;
    private final LogfileService logfileService;
    private final ActionService actionService;

    @Autowired
    public EventController(EventcategoryService eventcategoryService, LogeventService logeventService, RawlineService rawlineService, LogfileService logfileService, ActionService actionService) {
        this.eventcategoryService = eventcategoryService;
        this.logeventService = logeventService;
        this.rawlineService = rawlineService;
        this.logfileService = logfileService;
        this.actionService = actionService;
    }

    // EventCategory methods

    // Get all categories
    @GetMapping("/categories")
    public List<Eventcategory> getAllCategories() {
        return eventcategoryService.getAllCategories();
    }

    // Get all categories sorted by name
    @GetMapping("/categories/sorted")
    public List<Eventcategory> getAllCategoriesSorted() {
        return eventcategoryService.getAllCategoriesSorted();
    }

    // Get category by name
    @GetMapping("/categories/{categoryName}")
    public ResponseEntity<Eventcategory> getCategoryByName(@PathVariable String categoryName) {
        return eventcategoryService.getCategoryByName(categoryName)
                .map(category -> ResponseEntity.ok(category))
                .orElse(ResponseEntity.notFound().build());
    }

    // Search categories by term
    @GetMapping("/categories/search")
    public List<Eventcategory> searchCategories(@RequestParam String term) {
        return eventcategoryService.searchCategories(term);
    }

    // Create a new category
    @PostMapping("/categories")
    public ResponseEntity<Eventcategory> createCategory(@RequestBody Eventcategory category) {
        if (eventcategoryService.categoryExists(category.getCategoryname())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(eventcategoryService.createCategory(category));
    }

    // Update a category
    @PutMapping("/categories/{categoryName}")
    public ResponseEntity<Eventcategory> updateCategory(
            @PathVariable String categoryName,
            @RequestBody Eventcategory categoryDetails) {

        return eventcategoryService.updateCategory(categoryName, categoryDetails)
                .map(updatedCategory -> ResponseEntity.ok(updatedCategory))
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete a category
    @DeleteMapping("/categories/{categoryName}")
    public ResponseEntity<Void> deleteCategory(@PathVariable String categoryName) {
        boolean deleted = eventcategoryService.deleteCategory(categoryName);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    // Action methods

    // Get all actions
    @GetMapping("/actions")
    public List<Action> getAllActions() {
        return actionService.getAllActions();
    }

    // Get action by name
    @GetMapping("/actions/{actionName}")
    public ResponseEntity<Action> getActionByName(@PathVariable String actionName) {
        return actionService.getActionByName(actionName)
                .map(action -> ResponseEntity.ok(action))
                .orElse(ResponseEntity.notFound().build());
    }

    // Get actions by category
    @GetMapping("/actions/by-category/{categoryName}")
    public List<Action> getActionsByCategory(@PathVariable String categoryName) {
        Eventcategory category = new Eventcategory();
        category.setCategoryname(categoryName);
        return actionService.getActionsByCategory(category);
    }

    // Get actions with no category
    @GetMapping("/actions/uncategorized")
    public List<Action> getActionsWithNoCategory() {
        return actionService.getActionsWithNoCategory();
    }

    // Search actions by name
    @GetMapping("/actions/search")
    public List<Action> searchActions(@RequestParam String term) {
        return actionService.searchActionsByName(term);
    }

    // Create a new action
    @PostMapping("/actions")
    public ResponseEntity<Action> createAction(@RequestBody Action action) {
        if (actionService.actionExists(action.getAction())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(actionService.saveAction(action));
    }

    // Update an action
    @PutMapping("/actions/{actionName}")
    public ResponseEntity<Action> updateAction(
            @PathVariable String actionName,
            @RequestBody Action actionDetails) {

        return actionService.getActionByName(actionName)
                .map(existingAction -> {
                    // Update only what's allowed to be updated
                    if (actionDetails.getCategoryname() != null) {
                        existingAction.setCategoryname(actionDetails.getCategoryname());
                    }
                    return ResponseEntity.ok(actionService.saveAction(existingAction));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete an action
    @DeleteMapping("/actions/{actionName}")
    public ResponseEntity<Void> deleteAction(@PathVariable String actionName) {
        if (actionService.actionExists(actionName)) {
            actionService.deleteAction(actionName);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // LogEvent methods

    // Get all events
    @GetMapping("/logevents")
    public List<Logevent> getAllEvents() {
        return logeventService.getAllEvents();
    }

    // Get event by ID
    @GetMapping("/logevents/{id}")
    public ResponseEntity<Logevent> getEventById(@PathVariable Integer id) {
        return logeventService.getEventById(id)
                .map(event -> ResponseEntity.ok(event))
                .orElse(ResponseEntity.notFound().build());
    }

    // Get events by file ID
    @GetMapping("/logevents/by-file/{fileId}")
    public List<Logevent> getEventsByFile(@PathVariable Integer fileId) {
        Logfile file = new Logfile();
        file.setId(fileId);
        return logeventService.getEventsByFile(file);
    }

    // Get events with no alert
    @GetMapping("/logevents/no-alert")
    public List<Logevent> getEventsWithNoAlert() {
        return logeventService.getEventsWithNoAlert();
    }

    // Get events between timestamps
    @GetMapping("/logevents/time-range")
    public List<Logevent> getEventsBetween(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endTime) {
        return logeventService.getEventsBetween(startTime, endTime);
    }

    // Get latest events
    @GetMapping("/logevents/latest")
    public List<Logevent> getLatestEvents(@RequestParam(defaultValue = "10") int limit) {
        return logeventService.getLatestEvents(limit);
    }

    @GetMapping("/event-count")
    public List<Object[]> getEventCountTimeSeries(@RequestParam Instant startTime, @RequestParam Instant endTime) {
        return logeventService.getEventCountTimeSeries(startTime, endTime);
    }

    @GetMapping("/event-count/materialized")
    public List<Object[]> getEventPerHour(@RequestParam Instant startTime, @RequestParam Instant endTime) {
        return logeventService.getEventCountFromMaterializedView(startTime, endTime);
    }

    // Create a new event
    @PostMapping("/logevents")
    public ResponseEntity<Logevent> createEvent(@RequestBody Logevent event) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(logeventService.saveEvent(event));
    }

    // Update an event
    @PutMapping("/logevents/{id}")
    public ResponseEntity<Logevent> updateEvent(
            @PathVariable Integer id,
            @RequestBody Logevent eventDetails) {

        return logeventService.getEventById(id)
                .map(existingEvent -> {
                    // Update fields as needed
                    if (eventDetails.getFileid() != null) {
                        existingEvent.setFileid(eventDetails.getFileid());
                    }
                    if (eventDetails.getRawline() != null) {
                        existingEvent.setRawline(eventDetails.getRawline());
                    }
                    if (eventDetails.getAssociatedalertid() != null) {
                        existingEvent.setAssociatedalertid(eventDetails.getAssociatedalertid());
                    }
                    if (eventDetails.getTimestamp() != null) {
                        existingEvent.setTimestamp(eventDetails.getTimestamp());
                    }
                    return ResponseEntity.ok(logeventService.saveEvent(existingEvent));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete an event
    @DeleteMapping("/logevents/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Integer id) {
        if (logeventService.getEventById(id).isPresent()) {
            logeventService.deleteEvent(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // RawLine methods

    // Get all raw lines
    @GetMapping("/rawlines")
    public List<Rawline> getAllRawlines() {
        return rawlineService.getAllRawlines();
    }

    // Get raw line by content using POST (to handle special characters)
    @PostMapping("/rawlines/details")
    public ResponseEntity<Rawline> getRawlineByContentPost(@RequestBody Map<String, String> payload) {
        String rawline = payload.get("rawline");
        if (rawline == null) {
            return ResponseEntity.badRequest().body(null);
        }

        return rawlineService.getRawlineByContent(rawline)
                .map(line -> ResponseEntity.ok(line))
                .orElse(ResponseEntity.notFound().build());
    }

    // Search raw lines by message
    @GetMapping("/rawlines/search")
    public List<Rawline> searchRawlines(@RequestParam String term) {
        return rawlineService.searchRawlinesByMessage(term);
    }

    // Full text search
    @GetMapping("/rawlines/fulltext")
    public List<Rawline> fullTextSearch(@RequestParam String term) {
        return rawlineService.fullTextSearch(term);
    }

    // Advanced search
    @GetMapping("/rawlines/advanced-search")
    public List<Rawline> advancedSearch(
            @RequestParam(required = false) Integer sourceDeviceId,
            @RequestParam(required = false) Integer destDeviceId,
            @RequestParam(required = false) Integer sourcePort,
            @RequestParam(required = false) Integer destPort,
            @RequestParam(required = false) String actionId,
            @RequestParam(required = false) String messageText) {

        return rawlineService.advancedSearch(
                sourceDeviceId, destDeviceId, sourcePort, destPort, actionId, messageText);
    }

    // Create a new raw line
    @PostMapping("/rawlines")
    public ResponseEntity<Rawline> createRawline(@RequestBody Rawline rawline) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(rawlineService.saveRawline(rawline));
    }

    // Delete a rawline using POST instead of path parameter
    @PostMapping("/rawlines/delete")
    public ResponseEntity<Void> deleteRawlinePost(@RequestBody Map<String, String> payload) {
        String rawline = payload.get("rawline");
        if (rawline == null) {
            return ResponseEntity.badRequest().build();
        }

        if (rawlineService.getRawlineByContent(rawline).isPresent()) {
            rawlineService.deleteRawline(rawline);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // LogFile methods

    // Get all log files
    @GetMapping("/logfiles")
    public List<Logfile> getAllLogfiles() {
        return logfileService.getAllLogfiles();
    }

    // Get log file by ID
    @GetMapping("/logfiles/{id}")
    public ResponseEntity<Logfile> getLogfileById(@PathVariable Integer id) {
        return logfileService.getLogfileById(id)
                .map(file -> ResponseEntity.ok(file))
                .orElse(ResponseEntity.notFound().build());
    }

    // Create a new log file
    @PostMapping("/logfiles")
    public ResponseEntity<Logfile> createLogfile(@RequestBody Logfile logfile) {
        // Set the status to "Uploaded" regardless of what was provided
        logfile.setStatus(LogFileStatus.Uploaded);

        // Set the current timestamp if not provided
        if (logfile.getUploadtime() == null) {
            logfile.setUploadtime(Instant.now());
        }

        // Save the log file first to get an ID
        Logfile savedLogfile = logfileService.saveLogfile(logfile);

        // Process the file content asynchronously
        CompletableFuture.runAsync(() -> {
            logfileService.processLogfileContent(savedLogfile);
        });


        return ResponseEntity.status(HttpStatus.CREATED)
                .body(logfileService.saveLogfile(logfile));
    }

    // Update a log file
    @PutMapping("/logfiles/{id}")
    public ResponseEntity<Logfile> updateLogfile(
            @PathVariable Integer id,
            @RequestBody Logfile fileDetails) {

        return logfileService.getLogfileById(id)
                .map(existingFile -> {
                    // Update fields as needed
                    // Assuming Logfile has these fields (update as needed)
                    if (fileDetails.getFilename() != null) {
                        existingFile.setFilename(fileDetails.getFilename());
                    }
                    if (fileDetails.getUploadtime() != null) {
                        existingFile.setUploadtime(fileDetails.getUploadtime());
                    }
                    // Add other fields as needed
                    return ResponseEntity.ok(logfileService.saveLogfile(existingFile));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete a log file
    @DeleteMapping("/logfiles/{id}")
    public ResponseEntity<Void> deleteLogfile(@PathVariable Integer id) {
        if (logfileService.logfileExists(id)) {
            logfileService.deleteLogfile(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Statistics endpoints

    // Get event counts by file
    @GetMapping("/stats/events-by-file")
    public List<Object[]> getEventCountsByFile() {
        return logeventService.countEventsByFile();
    }

    // Get action counts by category
    @GetMapping("/stats/actions-by-category")
    public List<Object[]> getActionCountsByCategory() {
        return actionService.countActionsByCategory();
    }

    // Get raw line counts by source device
    @GetMapping("/stats/rawlines-by-source")
    public List<Object[]> getRawlineCountsBySource() {
        return rawlineService.countBySourceDevice();
    }

    // Get raw line counts by destination device
    @GetMapping("/stats/rawlines-by-destination")
    public List<Object[]> getRawlineCountsByDestination() {
        return rawlineService.countByDestinationDevice();
    }

    // Get raw line counts by action
    @GetMapping("/stats/rawlines-by-action")
    public List<Object[]> getRawlineCountsByAction() {
        return rawlineService.countByAction();
    }

    // Get event time series data
    @GetMapping("/stats/events-time-series")
    public List<Object[]> getEventTimeSeries(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endTime) {
        return logeventService.getEventCountTimeSeries(startTime, endTime);
    }

    /**
     * Complex report joining log events with multiple related entities
     * This query involves 4+ relations (LogEvent, RawLine, LogFile, Device, Action)
     */
    @GetMapping("/complex-report")
    public ResponseEntity<List<Object[]>> getComplexEventReport() {
        return ResponseEntity.ok(logeventService.getComplexEventReport());
    }

    /**
     * Identifies source devices with abnormally high traffic using subqueries
     * This is a non-trivial subquery application
     */
    @GetMapping("/high-traffic-sources")
    public ResponseEntity<List<Object[]>> getHighTrafficSources() {
        return ResponseEntity.ok(rawlineService.getHighTrafficSourceDevices());
    }
}