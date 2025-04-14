# Database Normalization Process

## Tables
- **USER** {
    UserID (PK),
    Name,
    Email,
    Username,
    Password_Hash,
    Role,
    CreatedAt,
    LastLogin
}
- **LOG_FILE** {
    FileID (PK),
    UploadedBy (FK to USER),
    SourceName,
    SourceType,
    Filename,
    UploadTime,
    Status,
    FileSize,
    RawContent
}
- **LOG_EVENT** {
    LogEventID (PK),
    FileID (FK to LOG_FILE),
    Timestamp,
    LogSource,
    SourceDeviceID (FK to DEVICE),
    DestinationDeviceID (FK to DEVICE),
    Action,
    Severity,
    Message,
    ParsedData,
    RawLine,
    EventCategoryID (FK to EVENT_CATEGORY),
    AssociatedAlertID (FK to ALERT)
}
- **EVENT_CATEGORY** {
    EventCategoryID (PK),
    CategoryName,
    Description
}
- **ALERT** {
    AlertID (PK),
    TriggeredAt,
    RuleID (FK to ALERT_RULE),
    Severity,
    Description,
    Status
}
- **DEVICE** {
    DeviceID (PK),
    IPAddress,
    Hostname,
    OperatingSystem,
    Location,
    DeviceType
}
- **INCIDENT_REPORT** {
    ReportID (PK),
    Title,
    Description,
    CreatedAt,
    CreatedBy (FK to USER),
    RelatedAlertID (FK to ALERT),
    Severity,
    Status
}
- **INCIDENT_EVENT_LINK** {
    LinkID (PK),
    ReportID (FK to INCIDENT_REPORT),
    LogEventID (FK to LOG_EVENT)
}
- **ALERT_RULE** {
    RuleID (PK),
    Name,
    Description,
    Severity,
    ConditionLogic,
    IsActive,
    CreatedBy (FK to USER),
    CreatedAt
}
- **THREAT_INTEL** {
    ThreatID (PK),
    Indicator,
    Type,
    Severity,
    Description
}

## First Normal Form
- Every table listed above has exactly one element per cell (no arrays within a cell).
- Every table above also has a primary key that the non-key columns depend on. And the primary key appears in exactly one row (it is unique).
- Therefore, all the above tables are already in First Normal Form.

## Second Normal Form
- All of the primary keys above are single-column orimary keys (not composite), therefore all non-key columns automatically depend on the whole primary key (since it is already in First Normal Form).
- Therefore, all of the tables above are already in Second Normal Form.

## Third Normal Form
-

## Boyce-Codd Normal Form (BCNF)
### Step 1: Identify Functional Dependencies
- 

### Step 2: Identify Candidate Keys
- 