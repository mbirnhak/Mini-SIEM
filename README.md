# Mini-SIEM: Digital Forensics Log Analyzer
A mini security information and event management system for my Spring 2025 Database Fundamentals Coruse.

## Name
Matthew Birnhak

## Purpose & Summary
This project aims to help cybersecurity analysts collect, store, analyze, and visualize log data from various sources for forensic investigations and threat detection. It will function as a lightweight Security Information and Event Management (SIEM) tool, providing log aggregation, centralized storage, and interactive dashboards for exploring system events.

The system will collect logs from sources such as web servers, firewalls, system event logs, and authentication records. Logs will be parsed, categorized, and stored in a structured database to enable efficient searching, filtering, and visualization. Users will be able to view real-time log streams, apply filters to sort logs by source, severity, or time range, and generate reports on specific security events.

## Proposed Entities  

The proposed system will include several key entities to manage log collection, storage, and visualization effectively:  

1. **Users** – Represents individuals who access the system, including cybersecurity analysts and administrators. Users can upload logs, apply filters, and configure alert rules.  

2. **Log Files** – Represents raw log data collected from different sources, such as web servers, firewalls, and system event logs. Each log file is parsed and stored for further analysis.  

3. **Log Events** – Represents individual log entries extracted from log files. Each event includes details such as timestamp, source, severity level, message content, and associated metadata.  

4. **Event Categories** – Defines classifications for log events, such as authentication attempts, network activity, or security alerts. Categorizing events helps users filter and analyze logs more efficiently.  

5. **Alerts** – Represents predefined rules that trigger notifications when certain conditions are met (e.g., multiple failed login attempts from the same IP). Alerts help detect potential security incidents in real time.  

These entities will form the foundation of the system, ensuring structured storage, efficient querying, and effective log analysis.


## Technology Stack
- Frontend: React.js
- Backeend: Java with Springboot
- Database: PostgreSQL

## User CRUD Operations
### Create
Users can upload logs or files containing logs.
### Read
Search and filter logs, view alert details, view different charts & diagrams of data.
### Update
Analysts review alerts, mark incidents as resolved. Can manually categorize logs.
### Delete
Remove outdated logs, clear false positives
