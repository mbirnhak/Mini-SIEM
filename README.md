# Mini-SIEM: Digital Forensics Log Analyzer
A mini security information and event management system for my Spring 2025 Database Fundamentals Course.

## Name
Matthew Birnhak

## Purpose & Summary
This project aims to help cybersecurity analysts collect, store, analyze, and visualize log data from various sources for forensic investigations and threat detection. It will function as a lightweight Security Information and Event Management (SIEM) tool, providing log aggregation, centralized storage, and interactive dashboards for exploring system events.

The system will collect logs from sources such as web servers, firewalls, system event logs, and authentication records. Logs will be parsed, categorized, and stored in a structured database to enable efficient searching, filtering, and visualization. Users will be able to view real-time log streams, apply filters to sort logs by source, severity, or time range, and generate reports on specific security events.

# Run Locally

## Step 1: Set Up PostgreSQL with Docker

First, start a PostgreSQL container locally using Docker:

```bash
docker run -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=postgres \
  timescale/timescaledb:2.14.2-pg14
```
## Step 2: Clone the Repository

Clone the project repository to your local machine:

```bash
git clone https://github.com/mbirnhak/Mini-SIEM.git
cd Mini-SIEM
```

## Step 3: Backend Setup

Navigate to the backend directory and run it.

```bash
cd siem
./gradlew bootRun
```

## Step 4: Frontend Setup

Setup frontend and install dependencies.

```bash
cd frontend
npm install
npm run dev
```

## Step 5: Open Application

Navigate to `http://localhost:5173`

There is a `example-logfile1.txt` file in the main directory that may be uploaded. It is automatically parsed on upload.

## Proposed Entities  

The proposed system will include several key entities to manage log collection, storage, and visualization effectively:  

1. **Users**:
- Represents individuals who access the system, including cybersecurity analysts and administrators. Users can upload logs, apply filters, and configure alert rules.  

2. **Log Files**:
- Represents raw log data collected from different sources, such as web servers, firewalls, and system event logs. Each log file is parsed and stored for further analysis

3. **Log Events**:
- Represents individual log entries extracted from log files. Each event includes details such as timestamp, source, severity level, message content, and associated metadata.

4. **Event Categories**:
- Defines classifications for log events, such as authentication attempts, network activity, or security alerts. Categorizing events helps users filter and analyze logs more efficiently.  

5. **Alerts**:
- Represents predefined rules that trigger notifications when certain conditions are met (e.g., multiple failed login attempts from the same IP). Alerts help detect potential security incidents in real time.  

6. **Devices**:
- Each log entry will be associated with a source and destination device
- Will still information related to such a device like ip_addr, hostname, OS, etc.

7. **Incident Reports**:
- Analysts can generate incident reports related to specific log events and alerts.

8. **Alert Rules**:
- Represents predefined conditions or thresholds that trigger alerts in the system. These rules help identify suspicious or malicious activities, such as repeated failed logins, unusual network traffic, or specific actions performed by unauthorized users.
- Alert rules are essential for automating detection of potential security incidents and minimizing manual monitoring efforts.

9. **Threat Intelligence**:
- Represents known threat data from external sources, such as IP addresses, domains, file hashes, and URLs, that are flagged as indicators of compromise (IoCs) or known bad actors.
- These entries help analysts correlate suspicious activities and identify potential threats based on recognized patterns.
- May be preloaded from external sources, but can also be uploaded/pulled from APIs to contain real time data.


These entities will form the foundation of the system, ensuring structured storage, efficient querying, and effective log analysis.


## Technology Stack
- Frontend: React.js
- Backeend: Java with Springboot
- Database: PostgreSQL with extension for time-series data (TimescaleDB)

## User CRUD Operations
### Create
Users can upload logs or files containing logs.
### Read
Search and filter logs, view alert details, view different charts & diagrams of data.
### Update
Analysts review alerts, mark incidents as resolved. Can manually categorize logs.
### Delete
Remove outdated logs, clear false positives

## List of All Final Tables:
- USER
- LOG_FILE
- LOG_EVENT
- RAW_LINE
- ACTION
- EVENT_CATEGORY
- ALERT
- DEVICE
- INCIDENT_REPORT
- INCIDENT_EVENT_LINK
- ALERT_RULE
- THREAT_INTEL

## ER Diagram
![alt text](image.png)

# Database Schema (Updated for Normalized Tables)

## USER

| Column          | Description                                              |
|-----------------|----------------------------------------------------------|
| UserID (PK)     | Unique user identifier                                   |
| Name            | User's full name                                         |
| Email (UNIQUE)  | User's email address (unique)                            |
| Username (UNIQUE) | Unique username for login                               |
| Password_Hash    | Hashed password for secure authentication               |
| Role            | User's role in the system (e.g., Admin, Analyst)         |
| CreatedAt       | Timestamp of account creation                            |
| LastLogin       | Timestamp of user's last login                           |

---

## LOG_FILE

| Column          | Description                                              |
|-----------------|----------------------------------------------------------|
| FileID (PK)     | Unique identifier for the uploaded log file              |
| UploadedBy (FK) | Reference to the user who uploaded the log file          |
| SourceName      | Name of the system or application that generated the log |
| SourceType      | Type/category of the log source (e.g., Firewall, Server) |
| Filename        | Name of the uploaded log file                            |
| UploadTime      | Timestamp indicating when the file was uploaded         |
| Status          | Current processing status (e.g., Pending, Complete)     |
| RawContent      | Raw text or data content of the uploaded log file        |

---

## LOG_EVENT

| Column             | Description                                              |
|--------------------|----------------------------------------------------------|
| LogEventID (PK)     | Unique identifier for each individual log event          |
| FileID (FK)         | Reference to the log file that contains this event       |
| Timestamp           | Date and time when the log event occurred                |
| RawLine (FK)        | Reference to the raw log line                             |
| AssociatedAlertID (FK) | Reference to an alert generated from this event, if any |

---

## RAW_LINE

| Column              | Description                                              |
|---------------------|----------------------------------------------------------|
| RawLine (PK)         | Original unparsed line from the log file                 |
| SourceDeviceID (FK)  | Reference to the source device involved in the event     |
| SourcePort           | Network port on the source device                        |
| DestinationDeviceID (FK) | Reference to the destination device involved in the event |
| DestinationPort      | Network port on the destination device                   |
| Action (FK)          | Reference to the action that occurred                    |
| Message              | Human-readable description or summary of the event      |
| ParsedData           | Structured data extracted from the raw log line          |

---

## ACTION

| Column         | Description                                          |
|----------------|------------------------------------------------------|
| Action (PK)    | Name of the action performed (e.g., login, file access)|
| CategoryName (FK) | Classification of the event type                |

---

## EVENT_CATEGORY

| Column            | Description                                        |
|-------------------|----------------------------------------------------|
| CategoryName (PK) | Name of the event category (e.g., Authentication)  |
| Description       | Description of the event category                  |

---

## ALERT

| Column              | Description                                              |
|---------------------|----------------------------------------------------------|
| AlertID (PK)         | Unique identifier for the alert                         |
| TriggeredAt          | Timestamp when the alert was generated                  |
| RuleID (FK)          | Reference to the rule that triggered the alert           |
| Status               | Current state of the alert (e.g., Open, Investigating, Resolved) |

---

## DEVICE

| Column              | Description                                              |
|---------------------|----------------------------------------------------------|
| DeviceID (PK)        | Unique identifier for the device                        |
| IPAddress            | IP address of the device                                |
| Hostname             | Name of the device on the network                       |
| OperatingSystem      | Operating system running on the device                  |
| Location             | Physical or logical location of the device (e.g., Data Center A) |
| DeviceType           | Classification of the device (e.g., Workstation, Server) |

---

## INCIDENT_REPORT

| Column              | Description                                              |
|---------------------|----------------------------------------------------------|
| ReportID (PK)        | Unique identifier for the incident report               |
| Title                | Title of the incident                                   |
| Description          | Detailed description of the incident and its impact     |
| CreatedAt            | Timestamp when the report was created                   |
| CreatedBy (FK)       | Reference to the user who created the report             |
| RelatedAlertID (FK)  | Reference to the primary alert associated with this incident |

---

## INCIDENT_EVENT_LINK

| Column              | Description                                              |
|---------------------|----------------------------------------------------------|
| ReportID (PK, FK)        | Reference to the associated incident report             |
| LogEventID (PK, FK)      | Reference to the related log event                       |

---

## ALERT_RULE

| Column              | Description                                              |
|---------------------|----------------------------------------------------------|
| RuleID (PK)          | Unique identifier for the detection rule                |
| Name                 | Name of the alert rule                                   |
| Description          | Explanation of what the rule is designed to detect      |
| Severity             | Default severity level assigned to triggered alerts     |
| ConditionLogic       | Logic or conditions used to detect suspicious activity  |
| IsActive             | Boolean indicating whether the rule is currently enabled|
| CreatedBy (FK)       | Reference to the user who created the rule               |
| CreatedAt            | Timestamp when the rule was created                     |

---

## THREAT_INTEL

| Column              | Description                                              |
|---------------------|----------------------------------------------------------|
| ThreatID (PK)        | Unique identifier for the threat intelligence entry     |
| Indicator            | Observable used to detect a threat (e.g., IP address, domain, hash) |
| Type                 | Type of indicator (e.g., IP, URL, File Hash)             |
| Severity             | Assessed threat level associated with the indicator     |
| Description          | Additional context or background about the threat       |

---

> **Note**: I was going to add support for hypertables on LogEvent and Alert table to increase query speed on time-series data. However, timescaledb does not support foreign key references to hypertables so this is omitted.


# Complex SQL Query Descriptions

## Complex Multi-Table Relations Queries

1. **Complex Event Report Query**: This query joins six tables (LogEvent, LogFile, RawLine, Device (twice, as source and destination), Action, and EventCategory) to produce a comprehensive event report. It retrieves detailed information about each log event including its timestamp, associated file information, raw line content, source and destination device hostnames, the action performed, and its category. This creates a consolidated view that would be impossible to achieve without joining multiple relations.

2. **Active Users Analysis Query**: This query joins four tables (User, IncidentReport, LogFile, and AlertRule) to identify users who have performed a minimum number of system actions. It counts distinct reports created, files uploaded, and alert rules defined by each user, then filters for those exceeding a specified activity threshold. The query demonstrates complex multi-table relationships by connecting user activity across multiple system components.

## Join Query

3. **Alert Summary by Rule Query**: This query joins the AlertRule and Alert tables to generate a statistical summary of how frequently each rule has been triggered. It produces a report showing each rule's ID, name, severity, total alert count, and most recent trigger time. The join between these tables allows for aggregating alert data while maintaining access to the rule details.

## Subquery Usage

4. **High Traffic Source Devices Query**: This query uses nested subqueries to identify devices generating abnormal amounts of network traffic. The innermost subquery calculates the average event count across all devices, the middle subquery finds devices exceeding this average, and the outer query retrieves detailed information about these high-traffic devices. This multi-level subquery approach enables identifying statistical outliers.

5. **Reports with Critical Events Query**: This query employs a subquery to find incident reports linked to security-critical events. It searches for reports containing events associated with specific high-importance categories like 'Critical', 'Security', or 'Intrusion'. The subquery filters events by examining their connection to actions of specific categories, then the main query retrieves the matching reports.

## Grouping with HAVING

6. **Frequently Triggered Rules Query**: This query groups alerts by rule and applies a HAVING clause to filter for rules that have triggered at least a minimum number of alerts. It retrieves rule details alongside alert statistics, but only for those rules meeting the frequency threshold. This helps identify the most problematic or noisy alert rules in the system.

## Set Operations Query

7. **Reports with Related Events Query**: This query uses UNION and EXCEPT set operations to find incident reports related to a specific alert. It combines reports directly associated with the alert and reports containing events linked to the alert, then removes reports created before the alert was triggered. This demonstrates how set operations can combine and filter results from different query conditions.