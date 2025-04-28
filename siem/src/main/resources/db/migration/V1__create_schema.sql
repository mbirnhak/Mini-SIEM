-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

CREATE TABLE IF NOT EXISTS "User" (
    UserID SERIAL PRIMARY KEY,
    Name VARCHAR(100),
    Email VARCHAR(100) UNIQUE NOT NULL,
    Username VARCHAR(50) UNIQUE NOT NULL,
    Password_Hash VARCHAR(255) NOT NULL,
    Role VARCHAR(50) CHECK (Role IN ('Admin', 'Analyst')),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastLogin TIMESTAMP
);

CREATE TABLE IF NOT EXISTS LogFile (
    FileID SERIAL PRIMARY KEY,
    UploadedBy INTEGER,  -- FK to USER
    SourceName VARCHAR(100),
    SourceType VARCHAR(50),  -- e.g., Firewall, Server
    Filename VARCHAR(100),
    UploadTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status VARCHAR(50) CHECK (Status IN ('Uploaded', 'Pending', 'Failed')),  -- e.g., Processed, Failed
    RawContent TEXT,
    FOREIGN KEY (UploadedBy) REFERENCES "User"(UserID)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Device (
    DeviceID SERIAL PRIMARY KEY,
    IPAddress INET, -- Store IP address with PostgreSQL's INET type
    Hostname VARCHAR(100),
    OperatingSystem VARCHAR(100),
    Location VARCHAR(100),
    DeviceType VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS EventCategory (
    CategoryName VARCHAR(100) PRIMARY KEY,
    Description TEXT
);

CREATE TABLE IF NOT EXISTS Action (
    Action VARCHAR(100) PRIMARY KEY,
    CategoryName VARCHAR(100),  -- FK to EVENT_CATEGORY
    FOREIGN KEY (CategoryName) REFERENCES EventCategory(CategoryName)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS AlertRule (
    RuleID SERIAL PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    Severity VARCHAR(50) NOT NULL CHECK (Severity IN ('Low', 'Medium', 'High')),
    ConditionLogic JSONB NOT NULL, -- JSON structure defining the rule logic
    IsActive BOOLEAN NOT NULL,  -- Whether to use the rule or not
    CreatedBy INTEGER,  -- FK to USER
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CreatedBy) REFERENCES "User"(UserID)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Alert (
    AlertID SERIAL PRIMARY KEY,
    TriggeredAt TIMESTAMP,
    RuleID INTEGER NOT NULL,  -- FK to ALERT_RULE
    Status VARCHAR(50) NOT NULL CHECK (Status IN ('Open', 'Investigating', 'Resolved')),
    FOREIGN KEY (RuleID) REFERENCES AlertRule(RuleID)
        ON DELETE CASCADE
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
    ParsedData JSONB,
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

CREATE TABLE IF NOT EXISTS LogEvent (
    LogEventID SERIAL PRIMARY KEY,
    FileID INTEGER NOT NULL,  -- FK to LOG_FILE
    Timestamp TIMESTAMP,
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

CREATE TABLE IF NOT EXISTS IncidentReport (
    ReportID SERIAL PRIMARY KEY,
    Title VARCHAR(100),
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CreatedBy INTEGER,  -- FK to USER
    RelatedAlertID INTEGER,  -- FK to ALERT
    FOREIGN KEY (CreatedBy) REFERENCES "User"(UserID)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (RelatedAlertID) REFERENCES Alert(AlertID)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS IncidentEventLink (
    ReportID INTEGER,  -- FK to INCIDENT_REPORT
    LogEventID INTEGER,  -- FK to LOG_EVENT
    PRIMARY KEY (ReportID, LogEventID),
    FOREIGN KEY (ReportID) REFERENCES IncidentReport(ReportID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (LogEventID) REFERENCES LogEvent(LogEventID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS ThreatIntel (
    ThreatID SERIAL PRIMARY KEY,
    Indicator VARCHAR(100) NOT NULL, -- e.g., 192.168.1.1 or malicious.com
    Type VARCHAR(50) NOT NULL, -- e.g., IP, Domain, URL
    Severity VARCHAR(50) NOT NULL CHECK (Severity IN ('Low', 'Medium', 'High')),
    Description TEXT
);

-- Materialized view for alert statistics
CREATE MATERIALIZED VIEW alert_statistics AS
SELECT
    ar.Severity,
    COUNT(a.AlertID) as alert_count,
    AVG(EXTRACT(EPOCH FROM (a.TriggeredAt - le.Timestamp))) as avg_detection_time
FROM Alert a
         JOIN AlertRule ar ON a.RuleID = ar.RuleID
         JOIN LogEvent le ON a.AlertID = le.AssociatedAlertID
GROUP BY ar.Severity;
CREATE UNIQUE INDEX ON alert_statistics (Severity);

-- Add full-text search capabilities to raw lines
ALTER TABLE RawLine ADD COLUMN search_vector tsvector;
CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
    ON RawLine FOR EACH ROW EXECUTE FUNCTION
    tsvector_update_trigger(search_vector, 'pg_catalog.english', Message);
CREATE INDEX idx_rawline_search ON RawLine USING GIN (search_vector);

-- Convert LogFile to hypertable (UploadTime is the time column)
SELECT create_hypertable('LogFile', 'UploadTime', if_not_exists => TRUE);
-- Convert LogEvent to hypertable (Timestamp is the time column)
SELECT create_hypertable('LogEvent', 'Timestamp', if_not_exists => TRUE);
-- Convert Alert to hypertable (TriggeredAt is the time column)
SELECT create_hypertable('Alert', 'TriggeredAt', if_not_exists => TRUE);
-- IncidentReport might not need hypertable unless you have thousands daily, but if yes:
SELECT create_hypertable('IncidentReport', 'CreatedAt', if_not_exists => TRUE);

-- Create Materialized View for counting the log events per hour
CREATE MATERIALIZED VIEW logevent_count_per_hour
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', "Timestamp") AS bucket,
    COUNT(*) AS logs_count,
    AVG(LENGTH(Message)) AS avg_message_length
FROM LogEvent
GROUP BY bucket
    WITH NO DATA;