CREATE TABLE IF NOT EXISTS User (
    UserID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name VARCHAR(100),
    Email VARCHAR(100) UNIQUE NOT NULL,
    Username VARCHAR(50) UNIQUE NOT NULL,
    Password_Hash VARCHAR(255) NOT NULL,
    Role VARCHAR(50) CHECK (Role IN ('Admin', 'Analyst')),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    LastLogin DATETIME
);

CREATE TABLE IF NOT EXISTS LogFile (
    FileID INTEGER PRIMARY KEY AUTOINCREMENT,
    UploadedBy INTEGER,  -- FK to USER
    SourceName VARCHAR(100),
    SourceType VARCHAR(50),  -- e.g., Firewall, Server
    Filename VARCHAR(100),
    UploadTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status VARCHAR(50) CHECK (Status IN ('Uploaded', 'Pending', 'Failed')),  -- e.g., Processed, Failed
    RawContent TEXT,
    FOREIGN KEY (UploadedBy) REFERENCES User(UserID)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS LogEvent (
    LogEventID INTEGER PRIMARY KEY AUTOINCREMENT,
    FileID INTEGER NOT NULL,  -- FK to LOG_FILE
    Timestamp DATETIME,
    RawLine TEXT NOT NULL, -- FK to RAW_LINE
    AssociatedAlertID INTEGER,  -- FK to ALERT
    FOREIGN KEY (FileID) REFERENCES LogFile(FileID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (RawLine) REFERENCES RawLine(RawLine)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (AssociatedAlertID) REFERENCES Alert(AlertID)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS RawLine (
    RawLine TEXT PRIMARY KEY,
    SourceDeviceID INTEGER,  -- FK to DEVICE
    SourcePort INTEGER,
    DestinationDeviceID INTEGER,  -- FK to DEVICE
    DestinationPort INTEGER,
    Action VARCHAR(100),  -- FK to ACTION
    Message TEXT,
    ParsedData JSON,
    FOREIGN KEY (SourceDeviceID) REFERENCES Device(DeviceID)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (DestinationDeviceID) REFERENCES Device(DeviceID)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (Action) REFERENCES Action(Action)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Action (
    Action VARCHAR(100) PRIMARY KEY,
    CategoryName VARCHAR(100),  -- FK to EVENT_CATEGORY
    FOREIGN KEY (CategoryName) REFERENCES EventCategory(CategoryName)
);

CREATE TABLE IF NOT EXISTS EventCategory (
    CategoryName VARCHAR(100) PRIMARY KEY,
    Description TEXT
);

CREATE TABLE IF NOT EXISTS Alert (
    AlertID INTEGER PRIMARY KEY AUTOINCREMENT,
    TriggeredAt DATETIME,
    RuleID INTEGER NOT NULL,  -- FK to ALERT_RULE
    Status VARCHAR(50) NOT NULL,  -- e.g., Open, Investigating, Resolved
    FOREIGN KEY (RuleID) REFERENCES AlertRule(RuleID)
);

CREATE TABLE IF NOT EXISTS Device (
    DeviceID INTEGER PRIMARY KEY AUTOINCREMENT,
    IPAddress VARCHAR(100),
    Hostname VARCHAR(100),
    OperatingSystem VARCHAR(100),
    Location VARCHAR(100),
    DeviceType VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS IncidentReport (
    ReportID INTEGER PRIMARY KEY AUTOINCREMENT,
    Title VARCHAR(100),
    Description TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    CreatedBy INTEGER,  -- FK to USER
    RelatedAlertID INTEGER,  -- FK to ALERT
    FOREIGN KEY (CreatedBy) REFERENCES User(UserID),
    FOREIGN KEY (RelatedAlertID) REFERENCES Alert(AlertID)
);

CREATE TABLE IF NOT EXISTS IncidentEventLink (
    ReportID INTEGER,  -- FK to INCIDENT_REPORT
    LogEventID INTEGER,  -- FK to LOG_EVENT
    PRIMARY KEY (ReportID, LogEventID),
    FOREIGN KEY (ReportID) REFERENCES IncidentReport(ReportID),
    FOREIGN KEY (LogEventID) REFERENCES LogEvent(LogEventID)
);

CREATE TABLE IF NOT EXISTS AlertRule (
    RuleID INTEGER PRIMARY KEY AUTOINCREMENT,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    Severity VARCHAR(50) NOT NULL,
    ConditionLogic JSON NOT NULL, -- JSON structure defining the rule logic
    IsActive BOOLEAN NOT NULL,  -- Whether to use the rule or not
    CreatedBy INTEGER,  -- FK to USER
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CreatedBy) REFERENCES User(UserID)
);

CREATE TABLE IF NOT EXISTS ThreatIntel (
    ThreatID INTEGER PRIMARY KEY AUTOINCREMENT,
    Indicator VARCHAR(100) NOT NULL, -- e.g., 192.168.1.1 or malicious.com
    Type VARCHAR(50) NOT NULL, -- e.g., IP, Domain, URL
    Severity VARCHAR(50) NOT NULL,
    Description TEXT
);