-- Seed data for log management system database
-- Create extension for pgcrypto if not exists. Used for hashing passwords.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users with bcrypt hashed passwords using pgcrypto
INSERT INTO "User" (Name, Email, Username, Password_Hash, Role, CreatedAt, LastLogin) VALUES
                                                                                          ('Admin User', 'admin@example.com', 'admin', crypt('admin_password', gen_salt('bf', 10)), 'Admin', NOW() - INTERVAL '30 days', NOW() - INTERVAL '1 day'),
                                                                                          ('Security Analyst', 'analyst@example.com', 'analyst', crypt('analyst_password', gen_salt('bf', 10)), 'Analyst', NOW() - INTERVAL '15 days', NOW() - INTERVAL '2 days');

-- Event Categories
INSERT INTO EventCategory (CategoryName, Description) VALUES
                                                          ('Authentication', 'User login and authentication events'),
                                                          ('Firewall', 'Network traffic and firewall events'),
                                                          ('System', 'Operating system and application events'),
                                                          ('Security', 'Security-related events and potential threats');

-- Actions
INSERT INTO Action (Action, CategoryName) VALUES
                                              ('Login', 'Authentication'),
                                              ('Logout', 'Authentication'),
                                              ('Failed Login', 'Authentication'),
                                              ('Allow', 'Firewall'),
                                              ('Deny', 'Firewall'),
                                              ('Warning', 'System'),
                                              ('Error', 'System'),
                                              ('Critical', 'System'),
                                              ('Malware Detected', 'Security'),
                                              ('Suspicious Activity', 'Security');

-- Devices
INSERT INTO Device (IPAddress, Hostname, OperatingSystem, Location, DeviceType) VALUES
                                                                                    ('192.168.1.1', 'gateway.local', 'pfSense 2.6.0', 'Server Room', 'Firewall'),
                                                                                    ('192.168.1.10', 'dc01.corp.local', 'Windows Server 2022', 'Server Room', 'Domain Controller'),
                                                                                    ('192.168.1.20', 'www01.corp.local', 'Ubuntu 22.04 LTS', 'Server Room', 'Web Server'),
                                                                                    ('192.168.1.100', 'ws-alice.corp.local', 'Windows 11', 'Office', 'Workstation'),
                                                                                    ('192.168.1.101', 'ws-bob.corp.local', 'macOS 13', 'Office', 'Workstation');

-- Alert Rules
INSERT INTO AlertRule (Name, Description, Severity, ConditionLogic, IsActive, CreatedBy, CreatedAt) VALUES
                                                                                                        ('Multiple Failed Logins', 'Alert when a user has more than 5 failed login attempts within 10 minutes', 'Medium', '{"condition": "count", "field": "Action", "value": "Failed Login", "threshold": 5, "timeWindow": 600}', TRUE, 1, NOW() - INTERVAL '20 days'),
                                                                                                        ('Suspicious IP Access', 'Alert when access is attempted from known malicious IP addresses', 'High', '{"condition": "match", "field": "SourceIP", "list": "malicious_ips"}', TRUE, 1, NOW() - INTERVAL '20 days'),
                                                                                                        ('Web Server Error Spike', 'Alert when web server errors increase by 200% over baseline', 'Medium', '{"condition": "anomaly", "field": "Action", "value": "Error", "deviceType": "Web Server", "multiplier": 2}', TRUE, 1, NOW() - INTERVAL '19 days');

-- Threat Intel
INSERT INTO ThreatIntel (Indicator, Type, Severity, Description) VALUES
                                                                     ('192.168.100.50', 'IP', 'High', 'Known malware command and control server'),
                                                                     ('malware.example.com', 'Domain', 'High', 'Phishing domain'),
                                                                     ('suspicious.js', 'Filename', 'Medium', 'Known malicious JavaScript file'),
                                                                     ('8.8.8.8', 'IP', 'Low', 'Test entry - Google DNS');

-- Log Files
INSERT INTO LogFile (UploadedBy, SourceName, SourceType, Filename, UploadTime, Status, RawContent) VALUES
                                                                                                       (1, 'Firewall', 'pfSense', 'fw_logs_20250415.log', NOW() - INTERVAL '13 days', 'Uploaded', 'Sample raw firewall logs content here...'),
                                                                                                       (2, 'Web Server', 'Apache', 'access_20250416.log', NOW() - INTERVAL '12 days', 'Uploaded', 'Sample raw web server logs content here...'),
                                                                                                       (1, 'Domain Controller', 'Windows Event Log', 'security_20250417.log', NOW() - INTERVAL '11 days', 'Uploaded', 'Sample raw Windows security logs content here...');

-- Raw Lines
INSERT INTO RawLine (RawLine, SourceDeviceID, SourcePort, DestinationDeviceID, DestinationPort, Action, Message, ParsedData) VALUES
                                                                                                                                 ('Apr 15 08:12:45 gateway.local pf: 192.168.1.100.52246 > 93.184.216.34.443: TCP connection', 4, 52246, NULL, 443, 'Allow', 'TCP connection from internal workstation to external web server', '{"protocol": "TCP", "bytes": 1024, "flags": "S"}'),
                                                                                                                                 ('Apr 15 08:15:22 gateway.local pf: 8.8.8.8.53 > 192.168.1.10.60123: UDP DNS response', NULL, 53, 2, 60123, 'Allow', 'DNS response from Google DNS to domain controller', '{"protocol": "UDP", "query": "example.com", "response": "93.184.216.34"}'),
                                                                                                                                 ('Apr 15 08:30:11 gateway.local pf: 192.168.100.50.443 > 192.168.1.101.39156: TCP blocked suspicious connection', NULL, 443, 5, 39156, 'Deny', 'Suspicious connection blocked from known malicious IP', '{"protocol": "TCP", "reason": "IP blocklist match"}'),
                                                                                                                                 ('Apr 16 10:15:36 www01.corp.local: GET /admin.php - 404 Not Found - Source IP: 192.168.1.100', 4, NULL, 3, 80, 'Error', 'HTTP 404 error for admin page', '{"method": "GET", "status": 404, "path": "/admin.php", "user-agent": "Mozilla/5.0"}'),
                                                                                                                                 ('Apr 17 09:23:41 dc01.corp.local: User bob failed login attempt - Reason: wrong password', 5, NULL, 2, NULL, 'Failed Login', 'Failed login attempt by user bob', '{"username": "bob", "reason": "wrong_password", "attempt": 3}');

-- Alerts
INSERT INTO Alert (TriggeredAt, RuleID, Status) VALUES
                                                    (NOW() - INTERVAL '10 days', 2, 'Resolved'),
                                                    (NOW() - INTERVAL '5 days', 1, 'Investigating'),
                                                    (NOW() - INTERVAL '2 days', 3, 'Open');

-- Log Events
INSERT INTO LogEvent (FileID, Timestamp, RawLine, AssociatedAlertID) VALUES
                                                                         (1, NOW() - INTERVAL '13 days' + INTERVAL '5 hours', 'Apr 15 08:12:45 gateway.local pf: 192.168.1.100.52246 > 93.184.216.34.443: TCP connection', NULL),
                                                                         (1, NOW() - INTERVAL '13 days' + INTERVAL '5 hours' + INTERVAL '3 minutes', 'Apr 15 08:15:22 gateway.local pf: 8.8.8.8.53 > 192.168.1.10.60123: UDP DNS response', NULL),
                                                                         (1, NOW() - INTERVAL '13 days' + INTERVAL '5 hours' + INTERVAL '18 minutes', 'Apr 15 08:30:11 gateway.local pf: 192.168.100.50.443 > 192.168.1.101.39156: TCP blocked suspicious connection', 1),
                                                                         (2, NOW() - INTERVAL '12 days' + INTERVAL '7 hours', 'Apr 16 10:15:36 www01.corp.local: GET /admin.php - 404 Not Found - Source IP: 192.168.1.100', 3),
                                                                         (3, NOW() - INTERVAL '11 days' + INTERVAL '6 hours', 'Apr 17 09:23:41 dc01.corp.local: User bob failed login attempt - Reason: wrong password', 2);

-- Incident Reports
INSERT INTO IncidentReport (Title, Description, CreatedAt, CreatedBy, RelatedAlertID) VALUES
                                                                                          ('Suspicious Connection Attempt Blocked', 'Firewall blocked connection attempt from known malicious IP. Investigation revealed user clicked on phishing email link.', NOW() - INTERVAL '9 days', 2, 1),
                                                                                          ('Multiple Failed Login Investigation', 'Multiple failed login attempts detected for user bob. User confirmed it was due to forgotten password after vacation.', NOW() - INTERVAL '4 days', 2, 2);

-- Incident Event Links
INSERT INTO IncidentEventLink (ReportID, LogEventID) VALUES
                                                         (1, 3),
                                                         (2, 5);

-- Refresh materialized views
SELECT refresh_materialized_views();

-- These statements show that your database is populated
SELECT 'Users: ' || COUNT(*) FROM "User";
SELECT 'Devices: ' || COUNT(*) FROM Device;
SELECT 'Log Files: ' || COUNT(*) FROM LogFile;
SELECT 'Log Events: ' || COUNT(*) FROM LogEvent;
SELECT 'Alerts: ' || COUNT(*) FROM Alert;