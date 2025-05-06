// In components/advanced-reports.ts
import {
    fetchComplexEventReport,
    fetchAlertSummaryByRule,
    fetchHighTrafficSources,
    fetchReportsWithCriticalEvents,
    fetchFrequentlyTriggeredRules,
    fetchActiveUsers,
    fetchReportsWithRelatedEvents
} from '../services/advanced-service.ts';

export async function loadAdvancedReportsTab() {
    try {
        const advancedReportsTab = document.getElementById('tab-advanced-reports');

        if (!advancedReportsTab) {
            console.error('Advanced reports tab element not found');
            return;
        }

        // Create the tab structure with report options
        advancedReportsTab.innerHTML = `
      <div class="advanced-reports-container">
        <h1>Advanced Reports</h1>
        
        <div class="report-selection">
          <select id="report-type-select">
            <option value="complex-event">Complex Event Report</option>
            <option value="alert-summary">Alert Summary by Rule</option>
            <option value="high-traffic">High Traffic Sources</option>
            <option value="critical-events">Reports with Critical Events</option>
            <option value="frequent-rules">Frequently Triggered Rules</option>
            <option value="active-users">Active Users</option>
            <option value="related-events">Reports with Related Events</option>
          </select>
          
          <div id="report-params" class="report-params">
            <!-- Parameters will be displayed here based on selection -->
          </div>
          
          <button id="generate-report-btn" class="generate-btn">Generate Report</button>
        </div>
        
        <div id="report-result" class="report-result">
          <!-- Report results will be displayed here -->
        </div>
      </div>
    `;

        // Add event listener for report type selection change
        const reportTypeSelect = document.getElementById('report-type-select');
        reportTypeSelect?.addEventListener('change', updateReportParams);

        // Initialize parameters for the default selected report
        updateReportParams();

        // Add event listener for generate report button
        const generateReportBtn = document.getElementById('generate-report-btn');
        generateReportBtn?.addEventListener('click', generateReport);

    } catch (error) {
        console.error('Error loading advanced reports tab:', error);
        const advancedReportsTab = document.getElementById('tab-advanced-reports');

        if (advancedReportsTab) {
            advancedReportsTab.innerHTML = '<div class="error">Failed to load advanced reports</div>';
        }
    }
}

function updateReportParams() {
    const reportTypeSelect = document.getElementById('report-type-select') as HTMLSelectElement;
    const reportParams = document.getElementById('report-params');

    if (!reportTypeSelect || !reportParams) return;

    const selectedReport = reportTypeSelect.value;

    // Clear existing parameters
    reportParams.innerHTML = '';

    // Add parameters based on selected report type
    switch (selectedReport) {
        case 'frequent-rules':
            reportParams.innerHTML = `
        <div class="param-group">
          <label for="min-alerts">Minimum Alerts:</label>
          <input type="number" id="min-alerts" value="5" min="1" max="100">
        </div>
      `;
            break;

        case 'active-users':
            reportParams.innerHTML = `
        <div class="param-group">
          <label for="min-actions">Minimum Actions:</label>
          <input type="number" id="min-actions" value="3" min="1" max="100">
        </div>
      `;
            break;

        case 'related-events':
            reportParams.innerHTML = `
        <div class="param-group">
          <label for="alert-id">Alert ID:</label>
          <input type="number" id="alert-id" value="1" min="1">
        </div>
      `;
            break;

        default:
            // No parameters needed for other reports
            break;
    }
}

async function generateReport() {
    try {
        const reportTypeSelect = document.getElementById('report-type-select') as HTMLSelectElement;
        const reportResult = document.getElementById('report-result');

        if (!reportTypeSelect || !reportResult) return;

        const selectedReport = reportTypeSelect.value;

        // Show loading state
        reportResult.innerHTML = '<div class="loading">Generating report...</div>';

        let data;

        // Fetch data based on selected report type
        switch (selectedReport) {
            case 'complex-event':
                data = await fetchComplexEventReport();
                displayComplexEventReport(data);
                break;

            case 'alert-summary':
                data = await fetchAlertSummaryByRule();
                displayAlertSummaryByRule(data);
                break;

            case 'high-traffic':
                data = await fetchHighTrafficSources();
                displayHighTrafficSources(data);
                break;

            case 'critical-events':
                data = await fetchReportsWithCriticalEvents();
                displayReportsWithCriticalEvents(data);
                break;

            case 'frequent-rules':
                const minAlertsInput = document.getElementById('min-alerts') as HTMLInputElement;
                const minAlerts = parseInt(minAlertsInput?.value || '5');
                data = await fetchFrequentlyTriggeredRules(minAlerts);
                displayFrequentlyTriggeredRules(data);
                break;

            case 'active-users':
                const minActionsInput = document.getElementById('min-actions') as HTMLInputElement;
                const minActions = parseInt(minActionsInput?.value || '3');
                data = await fetchActiveUsers(minActions);
                displayActiveUsers(data);
                break;

            case 'related-events':
                const alertIdInput = document.getElementById('alert-id') as HTMLInputElement;
                const alertId = parseInt(alertIdInput?.value || '1');
                data = await fetchReportsWithRelatedEvents(alertId);
                displayReportsWithRelatedEvents(data, alertId);
                break;

            default:
                reportResult.innerHTML = '<div class="error">Invalid report type selected</div>';
                break;
        }

    } catch (error) {
        console.error('Error generating report:', error);
        const reportResult = document.getElementById('report-result');

        if (reportResult) {
            reportResult.innerHTML = `<div class="error">Failed to generate report: ${error instanceof Error ? error.message : String(error)}</div>`;
        }
    }
}

function displayComplexEventReport(data: any[]) {
    const reportResult = document.getElementById('report-result');
    if (!reportResult) return;

    if (!data || data.length === 0) {
        reportResult.innerHTML = '<div class="empty-message">No data found for this report</div>';
        return;
    }

    let html = `
    <h2>Complex Event Report</h2>
    <p class="report-description">
      This report joins multiple tables (LogEvent, LogFile, RawLine, Device, Action, EventCategory) 
      to provide a comprehensive view of security events.
    </p>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Event ID</th>
            <th>Timestamp</th>
            <th>File</th>
            <th>Source</th>
            <th>Destination</th>
            <th>Action</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
  `;

    // Process each row of data
    data.forEach(row => {
        const eventId = row[0] || 'N/A';
        const timestamp = row[1] ? new Date(row[1] * 1000).toLocaleString() : 'N/A';
        const fileName = row[2] || 'N/A';
        const sourceHostname = row[6] || 'N/A';
        const destHostname = row[7] || 'N/A';
        const action = row[8] || 'N/A';
        const category = row[9] || 'N/A';

        html += `
      <tr>
        <td>${eventId}</td>
        <td>${timestamp}</td>
        <td>${fileName}</td>
        <td>${sourceHostname}</td>
        <td>${destHostname}</td>
        <td>${action}</td>
        <td>${category}</td>
      </tr>
    `;
    });

    html += `
        </tbody>
      </table>
    </div>
  `;

    reportResult.innerHTML = html;
}

function displayAlertSummaryByRule(data: any[]) {
    const reportResult = document.getElementById('report-result');
    if (!reportResult) return;

    if (!data || data.length === 0) {
        reportResult.innerHTML = '<div class="empty-message">No data found for this report</div>';
        return;
    }

    let html = `
    <h2>Alert Summary by Rule</h2>
    <p class="report-description">
      This report uses subqueries and aggregation functions to provide a summary of alerts by rule,
      including counts of open alerts for each rule.
    </p>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Rule ID</th>
            <th>Name</th>
            <th>Severity</th>
            <th>Total Alerts</th>
            <th>Open Alerts</th>
            <th>Last Triggered</th>
            <th>Created By</th>
          </tr>
        </thead>
        <tbody>
  `;

    // Process each row of data
    data.forEach(row => {
        const ruleId = row[0] || 'N/A';
        const name = row[1] || 'Unnamed Rule';
        const severity = row[2] || 'Unknown';
        const alertCount = row[3] || '0';
        const openAlerts = row[5] || '0';
        const lastTriggered = row[4] ? new Date(row[4] * 1000).toLocaleString() : 'Never';
        const createdBy = row[6] || 'N/A';

        // Add severity class based on severity value
        const severityClass = getSeverityClass(severity);

        html += `
      <tr>
        <td>${ruleId}</td>
        <td>${name}</td>
        <td><span class="severity-badge ${severityClass}">${severity}</span></td>
        <td>${alertCount}</td>
        <td>${openAlerts}</td>
        <td>${lastTriggered}</td>
        <td>${createdBy}</td>
      </tr>
    `;
    });

    html += `
        </tbody>
      </table>
    </div>
  `;

    reportResult.innerHTML = html;
}

function displayHighTrafficSources(data: any[]) {
    const reportResult = document.getElementById('report-result');
    if (!reportResult) return;

    if (!data || data.length === 0) {
        reportResult.innerHTML = '<div class="empty-message">No high traffic sources found</div>';
        return;
    }

    let html = `
    <h2>High Traffic Source Devices</h2>
    <p class="report-description">
      This report uses nested subqueries to identify devices generating more traffic than average,
      highlighting potential security concerns or network issues.
    </p>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Device ID</th>
            <th>Hostname</th>
            <th>IP Address</th>
            <th>Location</th>
            <th>Event Count</th>
          </tr>
        </thead>
        <tbody>
  `;

    // Process each row of data
    data.forEach(row => {
        const deviceId = row[0] || 'N/A';
        const hostname = row[1] || 'Unknown';
        const ipAddress = row[2] || 'N/A';
        const location = row[3] || 'Unknown';
        const eventCount = row[4] || '0';

        html += `
      <tr>
        <td>${deviceId}</td>
        <td>${hostname}</td>
        <td>${ipAddress}</td>
        <td>${location}</td>
        <td>${eventCount}</td>
      </tr>
    `;
    });

    html += `
        </tbody>
      </table>
    </div>
  `;

    reportResult.innerHTML = html;
}

function displayReportsWithCriticalEvents(data: any[]) {
    const reportResult = document.getElementById('report-result');
    if (!reportResult) return;

    if (!data || data.length === 0) {
        reportResult.innerHTML = '<div class="empty-message">No reports with critical events found</div>';
        return;
    }

    let html = `
    <h2>Reports with Critical Events</h2>
    <p class="report-description">
      This report uses subqueries to identify incident reports that contain events 
      from critical security categories.
    </p>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Report ID</th>
            <th>Title</th>
            <th>Created At</th>
            <th>Created By</th>
            <th>Related Alert</th>
          </tr>
        </thead>
        <tbody>
  `;

    // Process each row of data
    data.forEach(report => {
        const reportId = report.id || 'N/A';
        const title = report.title || 'Untitled Report';
        const createdAt = report.createdat ? new Date(report.createdat * 1000).toLocaleString() : 'N/A';
        const createdBy = report.createdby?.id || 'N/A';
        const relatedAlertId = report.relatedalertid?.id || 'None';

        html += `
      <tr>
        <td>${reportId}</td>
        <td>${title}</td>
        <td>${createdAt}</td>
        <td>${createdBy}</td>
        <td>${relatedAlertId}</td>
      </tr>
    `;
    });

    html += `
        </tbody>
      </table>
    </div>
  `;

    reportResult.innerHTML = html;
}

function displayFrequentlyTriggeredRules(data: any[]) {
    const reportResult = document.getElementById('report-result');
    if (!reportResult) return;

    if (!data || data.length === 0) {
        reportResult.innerHTML = '<div class="empty-message">No frequently triggered rules found with current parameters</div>';
        return;
    }

    const minAlertsInput = document.getElementById('min-alerts') as HTMLInputElement;
    const minAlerts = minAlertsInput?.value || '5';

    let html = `
    <h2>Frequently Triggered Rules (Min: ${minAlerts} alerts)</h2>
    <p class="report-description">
      This report uses GROUP BY with HAVING to identify alert rules that have been triggered 
      frequently, helping security teams focus on problematic patterns.
    </p>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Rule ID</th>
            <th>Name</th>
            <th>Severity</th>
            <th>Description</th>
            <th>Alert Count</th>
            <th>Last Triggered</th>
          </tr>
        </thead>
        <tbody>
  `;

    // Process each row of data
    data.forEach(row => {
        const ruleId = row[0] || 'N/A';
        const name = row[1] || 'Unnamed Rule';
        const severity = row[2] || 'Unknown';
        const description = row[3] || 'No description';
        const alertCount = row[4] || '0';
        const lastTriggered = row[5] ? new Date(row[5] * 1000).toLocaleString() : 'Never';

        // Add severity class based on severity value
        const severityClass = getSeverityClass(severity);

        html += `
      <tr>
        <td>${ruleId}</td>
        <td>${name}</td>
        <td><span class="severity-badge ${severityClass}">${severity}</span></td>
        <td>${description}</td>
        <td>${alertCount}</td>
        <td>${lastTriggered}</td>
      </tr>
    `;
    });

    html += `
        </tbody>
      </table>
    </div>
  `;

    reportResult.innerHTML = html;
}

function displayActiveUsers(data: any[]) {
    const reportResult = document.getElementById('report-result');
    if (!reportResult) return;

    if (!data || data.length === 0) {
        reportResult.innerHTML = '<div class="empty-message">No active users found with current parameters</div>';
        return;
    }

    const minActionsInput = document.getElementById('min-actions') as HTMLInputElement;
    const minActions = minActionsInput?.value || '3';

    let html = `
    <h2>Active Users (Min: ${minActions} actions)</h2>
    <p class="report-description">
      This report uses GROUP BY with HAVING to identify users who have performed a minimum number of actions,
      helping administrators track system usage and user engagement.
    </p>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Username</th>
            <th>Name</th>
            <th>Email</th>
            <th>Reports Created</th>
            <th>Files Uploaded</th>
            <th>Rules Created</th>
            <th>Total Actions</th>
          </tr>
        </thead>
        <tbody>
  `;

    // Process each row of data
    data.forEach(row => {
        const userId = row[0] || 'N/A';
        const username = row[1] || 'Unknown';
        const name = row[2] || 'Unknown';
        const email = row[3] || 'N/A';
        const reportsCreated = row[4] || '0';
        const filesUploaded = row[5] || '0';
        const rulesCreated = row[6] || '0';
        const totalActions = row[7] || '0';

        html += `
      <tr>
        <td>${userId}</td>
        <td>${username}</td>
        <td>${name}</td>
        <td>${email}</td>
        <td>${reportsCreated}</td>
        <td>${filesUploaded}</td>
        <td>${rulesCreated}</td>
        <td>${totalActions}</td>
      </tr>
    `;
    });

    html += `
        </tbody>
      </table>
    </div>
  `;

    reportResult.innerHTML = html;
}

function displayReportsWithRelatedEvents(data: any[], alertId: number) {
    const reportResult = document.getElementById('report-result');
    if (!reportResult) return;

    if (!data || data.length === 0) {
        reportResult.innerHTML = `<div class="empty-message">No reports with events related to Alert #${alertId} found</div>`;
        return;
    }

    let html = `
    <h2>Reports with Events Related to Alert #${alertId}</h2>
    <p class="report-description">
      This report uses SQL set operations (UNION, EXCEPT) to find incident reports related to a specific alert,
      including both directly associated reports and those containing events linked to the alert.
    </p>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Report ID</th>
            <th>Title</th>
            <th>Created At</th>
            <th>Created By</th>
            <th>Directly Related</th>
          </tr>
        </thead>
        <tbody>
  `;

    // Process each row of data
    data.forEach(report => {
        const reportId = report.id || 'N/A';
        const title = report.title || 'Untitled Report';
        const createdAt = report.createdat ? new Date(report.createdat * 1000).toLocaleString() : 'N/A';
        const createdBy = report.createdby?.id || 'N/A';
        // Check if this report is directly related to the alert
        const isDirectlyRelated = report.relatedalertid?.id === alertId;

        html += `
      <tr>
        <td>${reportId}</td>
        <td>${title}</td>
        <td>${createdAt}</td>
        <td>${createdBy}</td>
        <td>${isDirectlyRelated ? 'Yes' : 'No'}</td>
      </tr>
    `;
    });

    html += `
        </tbody>
      </table>
    </div>
  `;

    reportResult.innerHTML = html;
}

// Helper function for severity styling
function getSeverityClass(severity: string): string {
    switch (severity.toLowerCase()) {
        case 'critical':
            return 'severity-critical';
        case 'high':
            return 'severity-high';
        case 'medium':
            return 'severity-medium';
        case 'low':
            return 'severity-low';
        default:
            return 'severity-unknown';
    }
}