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
Are there any non-key columns that depend on another non-key column?

### *USER:*
- Everything fully depends on UserID except:
    - Username: Functionally depends on Email, since each email is associated with only one account.
    - Password_Hash: Also depends on Email for the same reason — each email is tied to a single password hash.

Analysis:
There is a transitive dependency: Username and Password_Hash depend on Email, which itself depends on the primary key UserID. Since Username and Password_Hash are non-key columns depending on another non-key column (Email), the table is not in Third Normal Form.

Solution:
To bring the table into 3NF, the transitive dependency must be removed. Email is set as a unique identifier (by adding a UNIQUE constraint), and the dependent columns are separated into a new table:

**USER**:
---
| UserID (PK) | Name | Email (FK, UNIQUE) | Role | CreatedAt | LastLogin |
|-------------|------|--------------------|------|-----------|-----------|
---

**USER_CREDENTIALS**:
---
| Email (PK) | Username | Password_Hash |
|------------|----------|----------------|
---

### *LOG_FILE:*
- Everything fully depends on FileID except:
    - FileSize: Functionally depends on RawContent, since the file size is calculated based on the content in the file.

Analysis:
There is a transitive dependency: FileSize depends on RawContent, which itself depends on the primary key FileID. Since FileSize is a non-key columns depending on another non-key column (RawContent), the table is not in Third Normal Form.

Solution:
To bring the table into 3NF, the transitive dependency must be removed. The field FileSize is dropped from the table since it can easily be calculated if needed. New table:
- **LOG_FILE**:
    - FileID (PK)
    - UploadedBy (FK to USER)
    - SourceName
    - SourceType
    - Filename
    - UploadTime
    - Status
    - RawContent

### *LOG_EVENT:*
- LOG_EVENT:
    - LogEventID (PK)
    - FileID (FK to LOG_FILE)
    - Timestamp
    - LogSource
    - SourceDeviceID (FK to DEVICE)
    - DestinationDeviceID (FK to DEVICE)
    - Action
    - Severity
    - Message
    - ParsedData
    - RawLine
    - EventCategoryID (FK to EVENT_CATEGORY)
    - AssociatedAlertID (FK to ALERT)

### *EVENT_CATEGORY:*
- EVENT_CATEGORY:
    - EventCategoryID (PK)
    - CategoryName
    - Description

### *ALERT:*
- ALERT:
    - AlertID (PK)
    - TriggeredAt
    - RuleID (FK to ALERT_RULE)
    - Severity
    - Description
    - Status

### *DEVICE:*
- DEVICE:
    - DeviceID (PK)
    - IPAddress
    - Hostname
    - OperatingSystem
    - Location
    - DeviceType

### *INCIDENT_REPORT:*
- INCIDENT_REPORT:
    - ReportID (PK)
    - Title
    - Description
    - CreatedAt
    - CreatedBy (FK to USER)
    - RelatedAlertID (FK to ALERT)
    - Severity
    - Status

### *INCIDENT_EVENT_LINK:*
- INCIDENT_EVENT_LINK:
    - LinkID (PK)
    - ReportID (FK to INCIDENT_REPORT)
    - LogEventID (FK to LOG_EVENT)

### *ALERT_RULE:*
- ALERT_RULE:
    - RuleID (PK)
    - Name
    - Description
    - Severity
    - ConditionLogic
    - IsActive
    - CreatedBy (FK to USER)
    - CreatedAt

### *THREAT_INTEL:*
- THREAT_INTEL:
    - ThreatID (PK)
    - Indicator
    - Type
    - Severity
    - Description

## Boyce-Codd Normal Form (BCNF)
### Step 1: Identify Functional Dependencies
- 

### Step 2: Identify Candidate Keys
- 