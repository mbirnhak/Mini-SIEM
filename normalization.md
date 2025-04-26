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

## **USER**:
- Everything fully depends on UserID except:
    - Username: Functionally depends on Email, since each email is associated with only one account.
    - Password_Hash: Also depends on Email for the same reason — each email is tied to a single password hash.

Analysis:
There is a transitive dependency: Username and Password_Hash depend on Email, which itself depends on the primary key UserID. Since Username and Password_Hash are non-key columns depending on another non-key column (Email), the table is not in Third Normal Form.

Solution:
To bring the table into 3NF, the transitive dependency must be removed. Email is set as a unique identifier (by adding a UNIQUE constraint), and the dependent columns are separated into a new table:

| Table: Users           |          |                    |      |           |           |
|------------------------|----------|--------------------|------|-----------|-----------|
| UserID (PK)            | Name     | Email (FK, UNIQUE) | Role | CreatedAt | LastLogin |

| Table: UserCredentials |          |               |
|------------------------|----------|---------------|
| Email (PK)             | Username | Password_Hash |

Updated Analysis:
The table decomposition is actually uneccessary and creates more work if a user changes their email (need to update in more than one place). Therefore, we will move the Username and Password_Hash back to the Users table and simply make Email and Username UNIQUE constraints. This makes the Password_Hash only dependent on keyed columns, since the UNIQUE columns are candidate keys, therefore making it 3NF. Updated table:

| Table: Users           |          |                |                   |               |      |           |           |
|------------------------|----------|----------------|-------------------|---------------|------|-----------|-----------|
| UserID (PK)            | Name     | Email (UNIQUE) | Username (UNIQUE) | Password_Hash | Role | CreatedAt | LastLogin |

---

## **LOG_FILE**:
- Everything fully depends on FileID except:
    - FileSize: Functionally depends on RawContent, since the file size is calculated based on the content in the file.

Analysis:
There is a transitive dependency: FileSize depends on RawContent, which itself depends on the primary key FileID. Since FileSize is a non-key columns depending on another non-key column (RawContent), the table is not in Third Normal Form.

Solution:
To bring the table into 3NF, the transitive dependency must be removed. The field FileSize is dropped from the table since it can easily be calculated if needed. New table:

| Table: LogFile         |               |            |             |          |             |        |             |
|------------------------|---------------|------------|-------------|----------|-------------|--------|-------------|
| FileID (PK)            | UploadedBy(FK)| SourceName | SourceType  | Filename | UploadTime  | Status | RawContent  |

---

## **LOG_EVENT**:
- The table is not in 3NF, because SourceDeviceID, SourcePort, DestinationDeviceID, DestinationPort, Action, Severity, Message, ParsedData, and EventCategoryID depend on RawLine. And EventCategoryID depends on Action.

Analysis: 
RawLine determines SourceDeviceID, SourcePort, DestinationDeviceID, DestinationPort, Action, Severity, Message, ParsedData, and EventCategoryID. Furthermore, Action determine EventCategoryID since the event category something falls into is determined by the specific action that occurred. For example, the Actoin: "login failed" determines the EventCategory: "Authentication".

Solution:
To bring the table into 3NF, the transitive dependencies are removed. SourceDeviceID, SourcePort, DestinationDeviceID, DestinationPort, Action, Severity, Message, and ParsedData are moved to a new table called RAW_LINE. The RawLine is the PK of this table and a FK in the LOG_EVENT table. Lastly, another table is created for ACTION. The Aciton is the PK and is referenced as the FK in the RAW_LINE table. The new ACTION table includes the EventCategoryID.


| Table: LogEvent              |             |           |           |              |                        |
|------------------------------|-------------|-----------|-----------|--------------|------------------------|
| LogEventID (PK)              | FileID (FK) | Timestamp | LogSource | RawLine (FK) | AssociatedAlertID (FK) |

| Table: RawLine  |       |       |               |       |             |          |         |             |
|-------------------------------|----------------------|-------------|----------------------------|------------------|-------------|----------|---------|-------------|
| RawLine (PK)                  | SourceDeviceID (FK)  | SourcePort  | DestinationDeviceID (FK)   | DestinationPort  | Action (FK) | Severity | Message | ParsedData  |

| Table: Action       |                      |
|---------------------|----------------------|
| Action (PK)         | EventCategoryID (FK) |

---

## **EVENT_CATEGORY**:
- The table is not in 3NF. The field Description is determiend by the CategoryName.

Analysis:
CategoryName determines the value of Description. This is because the Description field describes the meaning of the CategoryName.

Solution:
The EventCategoryID is dropped and the CategoryName is made to be the PK.

| Table: EventCategory        |             |
|-----------------------------|-------------|
| CategoryName (PK)           | Description |

---

## **ALERT**:
- This table is not in 3NF. The Severity and Description are determines by the RuleID which is a non-key column.

Analysis: 
The Severity and Description are determined by the Rule that governs them.

Solution:
These values are removed since they are already covered in the ALERT_RULE table anyways and can be accessed via the FK reference in RuleID.

| Table: Alert                |             |                           |        |
|-----------------------------|-------------|---------------------------|--------|
| AlertID (PK)                | TriggeredAt | RuleID (FK to ALERT_RULE) | Status |

---

## **DEVICE**:
- Assuming IP addresses can be dynamic (changing), every column depends only on the DeviceID. So, the table statys the same.

| Table: Device              |             |         |                 |          |            |
|----------------------------|-------------|---------|-----------------|----------|------------|
| DeviceID (PK)              | IPAddress   | Hostname| OperatingSystem | Location | DeviceType |

---

## **INCIDENT_REPORT**:
- This table is not in 3NF. Severity and status depend on RelatedAlertID.

Analysis: 
The Severity is determined by the Rule that governs the RelatedAlertID. Therefore, it depends on RelatedAlertID. Status is determined by the RelatedAlertID since the alert keeps track of the status of the incident referenced by the alert.

Solution:
These values are removed since they are already covered in the ALERT table or through it (in the ALERT_RULE table) and can be accessed via the FK reference in RelatedAlertID.

| Table: IncidentReport      |       |             |           |                        |                              |
|----------------------------|-------|-------------|-----------|------------------------|------------------------------|
| ReportID (PK)              | Title | Description | CreatedAt | CreatedBy (FK to USER) | RelatedAlertID (FK to ALERT) |

---

## **INCIDENT_EVENT_LINK**:
- This table is already in 3NF since all columns depend only on the primary key. However, we will remove the LinkID and create a composite key from ReportID and LogEventID since the LinkID is uneccessary.

| Table: Incident_Event_Link           |                                  |
|--------------------------------------|----------------------------------|
| ReportID (PK, FK to INCIDENT_REPORT) | LogEventID (PK, FK to LOG_EVENT) |

---

## **ALERT_RULE**:
- This table is already in 3NF since all columns depend only on the primary key.

| Table: Alert_Rule         |             |          |                |          |                        |           |
|---------------------------|-------------|----------|----------------|----------|------------------------|-----------|
| RuleID (PK)        | Name | Description | Severity | ConditionLogic | IsActive | CreatedBy (FK to USER) | CreatedAt |

---

## **THREAT_INTEL**:
- This table is already in 3NF since all columns depend only on the primary key.

| Table: Threat_Intel   |           |      |          |             |
|-----------------------|-----------|------|----------|-------------|
| ThreatID (PK)         | Indicator | Type | Severity | Description |

## Boyce-Codd Normal Form (BCNF)
Whenever column B --> A, then B is unique. 

The table below is not in BCNF:

| Table: UserCredentials |          |               |
|------------------------|----------|---------------|
| Email (PK)             | Username | Password_Hash |

This is because Username should also a unique value, since it can be used to sign in instead of an email. Therefore, the column Username determines both Email and Password_Hash. To solve this we simply make Username unique. This makes it a candidate key and unique, which converts the table to BCNF.

| Table: UserCredentials |                   |               |
|------------------------|-------------------|---------------|
| Email (PK)             | Username (UNIQUE) | Password_Hash |

---

Updated analysis:
Since the UserCredentials table has been removed this is no longer neccessary. And the updated Users table is in BCNF since for any column that is determined by another, is determined by a unique column.

Everything else is in BCNF, therefore, all tables are now correctly converted to BCNF and normalization is complete.