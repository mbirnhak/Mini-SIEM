package edu.trincoll.siem.Controller;

import edu.trincoll.siem.Model.*;
import edu.trincoll.siem.Service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.Arrays;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

public class EventControllerTest {

    private MockMvc mockMvc;

    @Mock
    private EventcategoryService eventcategoryService;

    @Mock
    private ActionService actionService;

    @Mock
    private LogeventService logeventService;

    @Mock
    private RawlineService rawlineService;

    @Mock
    private LogfileService logfileService;

    @InjectMocks
    private EventController eventController;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(eventController).build();
    }

    // EventCategory Tests
    @Test
    public void testGetAllCategories() throws Exception {
        Eventcategory category1 = new Eventcategory();
        category1.setCategoryname("Authentication");
        category1.setDescription("Authentication related events");

        Eventcategory category2 = new Eventcategory();
        category2.setCategoryname("Access");
        category2.setDescription("Access related events");

        when(eventcategoryService.getAllCategories()).thenReturn(Arrays.asList(category1, category2));

        mockMvc.perform(get("/api/events/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].categoryname", is("Authentication")))
                .andExpect(jsonPath("$[1].categoryname", is("Access")));
    }

    @Test
    public void testGetCategoryByName() throws Exception {
        Eventcategory category = new Eventcategory();
        category.setCategoryname("Authentication");
        category.setDescription("Authentication related events");

        when(eventcategoryService.getCategoryByName("Authentication")).thenReturn(Optional.of(category));

        mockMvc.perform(get("/api/events/categories/Authentication"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.categoryname", is("Authentication")))
                .andExpect(jsonPath("$.description", is("Authentication related events")));
    }

    @Test
    public void testCreateCategory() throws Exception {
        Eventcategory category = new Eventcategory();
        category.setCategoryname("Network");
        category.setDescription("Network related events");

        when(eventcategoryService.categoryExists(anyString())).thenReturn(false);
        when(eventcategoryService.createCategory(any(Eventcategory.class))).thenReturn(category);

        mockMvc.perform(post("/api/events/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"categoryname\":\"Network\",\"description\":\"Network related events\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.categoryname", is("Network")))
                .andExpect(jsonPath("$.description", is("Network related events")));
    }

    // Action Tests
    @Test
    public void testGetAllActions() throws Exception {
        Action action1 = new Action();
        action1.setAction("LOGIN");

        Action action2 = new Action();
        action2.setAction("LOGOUT");

        when(actionService.getAllActions()).thenReturn(Arrays.asList(action1, action2));

        mockMvc.perform(get("/api/events/actions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].action", is("LOGIN")))
                .andExpect(jsonPath("$[1].action", is("LOGOUT")));
    }

    @Test
    public void testGetActionByName() throws Exception {
        Action action = new Action();
        action.setAction("LOGIN");

        when(actionService.getActionByName("LOGIN")).thenReturn(Optional.of(action));

        mockMvc.perform(get("/api/events/actions/LOGIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.action", is("LOGIN")));
    }

    // LogEvent Tests
    @Test
    public void testGetAllEvents() throws Exception {
        Logevent event1 = new Logevent();
        event1.setId(1);
        event1.setTimestamp(Instant.now());

        Logevent event2 = new Logevent();
        event2.setId(2);
        event2.setTimestamp(Instant.now());

        when(logeventService.getAllEvents()).thenReturn(Arrays.asList(event1, event2));

        mockMvc.perform(get("/api/events/logevents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[1].id", is(2)));
    }

    @Test
    public void testGetEventById() throws Exception {
        Logevent event = new Logevent();
        event.setId(1);
        event.setTimestamp(Instant.now());

        when(logeventService.getEventById(1)).thenReturn(Optional.of(event));

        mockMvc.perform(get("/api/events/logevents/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)));
    }

    @Test
    public void testCreateEvent() throws Exception {
        Logevent event = new Logevent();
        event.setId(1);
        event.setTimestamp(Instant.now());

        when(logeventService.saveEvent(any(Logevent.class))).thenReturn(event);

        mockMvc.perform(post("/api/events/logevents")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":1,\"timestamp\":\"2023-01-01T00:00:00Z\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(1)));
    }

    // RawLine Tests
    @Test
    public void testGetAllRawlines() throws Exception {
        Rawline rawline1 = new Rawline();
        rawline1.setRawline("log line 1");

        Rawline rawline2 = new Rawline();
        rawline2.setRawline("log line 2");

        when(rawlineService.getAllRawlines()).thenReturn(Arrays.asList(rawline1, rawline2));

        mockMvc.perform(get("/api/events/rawlines"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].rawline", is("log line 1")))
                .andExpect(jsonPath("$[1].rawline", is("log line 2")));
    }

    @Test
    public void testSearchRawlines() throws Exception {
        Rawline rawline = new Rawline();
        rawline.setRawline("log line with error");
        rawline.setMessage("System error occurred");

        when(rawlineService.searchRawlinesByMessage("error")).thenReturn(Arrays.asList(rawline));

        mockMvc.perform(get("/api/events/rawlines/search?term=error"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].rawline", is("log line with error")))
                .andExpect(jsonPath("$[0].message", is("System error occurred")));
    }

    // LogFile Tests
    @Test
    public void testGetAllLogfiles() throws Exception {
        Logfile logfile1 = new Logfile();
        logfile1.setId(1);
        logfile1.setFilename("system.log");

        Logfile logfile2 = new Logfile();
        logfile2.setId(2);
        logfile2.setFilename("access.log");

        when(logfileService.getAllLogfiles()).thenReturn(Arrays.asList(logfile1, logfile2));

        mockMvc.perform(get("/api/events/logfiles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].filename", is("system.log")))
                .andExpect(jsonPath("$[1].id", is(2)))
                .andExpect(jsonPath("$[1].filename", is("access.log")));
    }

    @Test
    public void testGetLogfileById() throws Exception {
        Logfile logfile = new Logfile();
        logfile.setId(1);
        logfile.setFilename("system.log");

        when(logfileService.getLogfileById(1)).thenReturn(Optional.of(logfile));

        mockMvc.perform(get("/api/events/logfiles/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.filename", is("system.log")));
    }

    @Test
    public void testCreateLogfile() throws Exception {
        Logfile logfile = new Logfile();
        logfile.setId(1);
        logfile.setFilename("system.log");

        when(logfileService.saveLogfile(any(Logfile.class))).thenReturn(logfile);

        mockMvc.perform(post("/api/events/logfiles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":1,\"filename\":\"system.log\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.filename", is("system.log")));
    }

    // Statistics Tests
    @Test
    public void testGetEventCountsByFile() throws Exception {
        Object[] stat1 = {1, 50L};
        Object[] stat2 = {2, 30L};

        when(logeventService.countEventsByFile()).thenReturn(Arrays.asList(stat1, stat2));

        mockMvc.perform(get("/api/events/stats/events-by-file"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0][0]", is(1)))
                .andExpect(jsonPath("$[0][1]", is(50)))
                .andExpect(jsonPath("$[1][0]", is(2)))
                .andExpect(jsonPath("$[1][1]", is(30)));
    }

    @Test
    public void testGetActionCountsByCategory() throws Exception {
        Object[] stat1 = {"Authentication", 10L};
        Object[] stat2 = {"Access", 15L};

        when(actionService.countActionsByCategory()).thenReturn(Arrays.asList(stat1, stat2));

        mockMvc.perform(get("/api/events/stats/actions-by-category"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0][0]", is("Authentication")))
                .andExpect(jsonPath("$[0][1]", is(10)))
                .andExpect(jsonPath("$[1][0]", is("Access")))
                .andExpect(jsonPath("$[1][1]", is(15)));
    }
}