import { fetchApi, postApi } from './api';
import { Incidentreport } from '../types';

/**
 * Loads all incident reports and displays them in the incident reports tab
 */
export async function loadIncidentReports() {
    try {
        const response = await fetchApi('/incidents/reports/dateRange?startDate=1970-01-01T00:00:00Z&endDate=2099-12-31T23:59:59Z');
        const reports = await response.json();
        const incidentReportsTab = document.getElementById('tab-incident-reports');

        if (!incidentReportsTab) {
            console.error('Incident reports tab element not found');
            return;
        }

        // Create table structure first
        incidentReportsTab.innerHTML = `
        <div class="table-container" id="incident-reports-table-container">
          <table class="data-table" id="incident-reports-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Created At</th>
                <th>Created By</th>
                <th>Related Alert</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="incident-reports-body">
              <!-- Incident reports will be loaded here -->
            </tbody>
          </table>
        </div>
        `;

        const incidentReportsTableBody = document.getElementById('incident-reports-body');

        if (!incidentReportsTableBody) {
            console.error('Incident reports table body element not found after creation');
            return;
        }

        // Process each incident report and add to table
        reports.forEach((report: Incidentreport) => {
            const row = document.createElement('tr');

            // Extract incident report details with fallbacks
            const title = report.title || 'Untitled Report';
            const createdAt = report.createdat ? new Date(report.createdat).toLocaleString() : 'Unknown';
            const createdBy = report.createdby?.id || 'Unknown User';
            const relatedAlert = report.relatedalertid?.id ? `Alert #${report.relatedalertid.id}` : 'None';

            row.innerHTML = `
  <td>${title}</td>
  <td>${createdAt}</td>
  <td>${createdBy}</td>
  <td>${relatedAlert}</td>
  <td>
    <button class="action-btn view-btn" data-reportid="${report.id}">View</button>
    <button class="action-btn events-btn" data-reportid="${report.id}">Linked Events</button>
  </td>
`;

            incidentReportsTableBody.appendChild(row);
        });

        // If no incident reports were found
        if (reports.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="5" class="empty-message">No incident reports found</td>';
            incidentReportsTableBody.appendChild(emptyRow);
        }

        // Add event listeners for action buttons
        addReportActionListeners();

    } catch (error) {
        console.error('Error loading incident reports:', error);
        const incidentReportsTab = document.getElementById('tab-incident-reports');

        if (incidentReportsTab) {
            incidentReportsTab.innerHTML = '<div class="error">Failed to load incident reports</div>';
        }
    }
}

/**
 * Loads incident reports related to a specific alert
 * @param alertId The ID of the alert to get related reports for
 */
export async function loadReportsByAlert(alertId: string) {
    try {
        const response = await fetchApi(`/incidents/reports/alert/${alertId}`);
        const reports = await response.json();
        displayFilteredReports(reports, `Incident Reports for Alert #${alertId}`);
    } catch (error) {
        console.error(`Error loading reports for alert ${alertId}:`, error);
        showReportLoadError(`Failed to load reports for alert ${alertId}`);
    }
}

/**
 * Loads reports created by a specific user
 * @param userId The ID of the user who created the reports
 */
export async function loadReportsByUser(userId: string) {
    try {
        const response = await fetchApi(`/incidents/reports/user/${userId}`);
        const reports = await response.json();
        displayFilteredReports(reports, `Incident Reports by User #${userId}`);
    } catch (error) {
        console.error(`Error loading reports for user ${userId}:`, error);
        showReportLoadError(`Failed to load reports for user ${userId}`);
    }
}

/**
 * Gets a specific incident report by ID
 * @param reportId The ID of the report to retrieve
 */
export async function getReportById(reportId: string) {
    try {
        // The API doesn't have a direct endpoint for getting a report by ID,
        // so we'll use the title endpoint and find the report in the results
        const allReportsResponse = await fetchApi('/incidents/reports/dateRange?startDate=1970-01-01T00:00:00Z&endDate=2099-12-31T23:59:59Z');
        const allReports = await allReportsResponse.json();

        // Find the report with the matching ID
        const report = allReports.find((r: Incidentreport) => r.id.toString() === reportId);

        if (!report) {
            throw new Error(`Report with ID ${reportId} not found`);
        }

        return report;
    } catch (error) {
        console.error(`Error getting report ${reportId}:`, error);
        throw error;
    }
}

/**
 * Gets events linked to a specific incident report
 * @param reportId The ID of the report to get linked events for
 */
export async function getLinkedEvents(reportId: string) {
    try {
        const response = await fetchApi(`/incidents/links/report/${reportId}`);
        return await response.json();
    } catch (error) {
        console.error(`Error getting linked events for report ${reportId}:`, error);
        throw error;
    }
}

/**
 * Creates a new incident report
 * @param reportData The report data to create
 */
export async function createIncidentReport(reportData: any) {
    try {
        const response = await postApi('/incidents/report', reportData);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create incident report: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating incident report:', error);
        throw error;
    }
}

/**
 * Creates a link between an incident report and an event
 * @param reportId The ID of the report
 * @param eventId The ID of the event
 */
export async function linkEventToReport(reportId: string, eventId: string) {
    try {
        const linkData = {
            incidentreportid: {
                id: parseInt(reportId)
            },
            logeventid: {
                id: parseInt(eventId)
            }
        };

        const response = await postApi('/incidents/link', linkData);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to link event to report: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error linking event ${eventId} to report ${reportId}:`, error);
        throw error;
    }
}

/**
 * Displays filtered incident reports with a custom heading
 * @param reports The reports to display
 * @param heading The heading to show above the reports
 */
function displayFilteredReports(reports: Incidentreport[], heading: string) {
    const incidentReportsTab = document.getElementById('tab-incident-reports');

    if (!incidentReportsTab) {
        console.error('Incident reports tab element not found');
        return;
    }

    // Create table structure with heading
    incidentReportsTab.innerHTML = `
    <div class="filter-heading">${heading}</div>
    <div class="table-container" id="incident-reports-table-container">
      <table class="data-table" id="incident-reports-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Created At</th>
            <th>Created By</th>
            <th>Related Alert</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="incident-reports-body">
          <!-- Filtered incident reports will be loaded here -->
        </tbody>
      </table>
    </div>
    `;

    const incidentReportsTableBody = document.getElementById('incident-reports-body');

    if (!incidentReportsTableBody) {
        console.error('Incident reports table body element not found after creation');
        return;
    }

    // Process each incident report and add to table
    reports.forEach((report: Incidentreport) => {
        const row = document.createElement('tr');

        // Extract incident report details with fallbacks
        const title = report.title || 'Untitled Report';
        const createdAt = report.createdat ? new Date(report.createdat).toLocaleString() : 'Unknown';
        const createdBy = report.createdby?.id || 'Unknown User';
        const relatedAlert = report.relatedalertid?.id ? `Alert #${report.relatedalertid.id}` : 'None';

        row.innerHTML = `
<td>${title}</td>
<td>${createdAt}</td>
<td>${createdBy}</td>
<td>${relatedAlert}</td>
<td>
  <button class="action-btn view-btn" data-reportid="${report.id}">View</button>
  <button class="action-btn events-btn" data-reportid="${report.id}">Linked Events</button>
</td>
`;

        incidentReportsTableBody.appendChild(row);
    });

    // If no incident reports were found
    if (reports.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="5" class="empty-message">No incident reports found</td>';
        incidentReportsTableBody.appendChild(emptyRow);
    }

    // Add event listeners for action buttons
    addReportActionListeners();
}

/**
 * Helper function to add event listeners to report action buttons
 */
function addReportActionListeners() {
    // View report button
    document.querySelectorAll('.view-btn[data-reportid]').forEach(button => {
        button.addEventListener('click', (e) => {
            const reportId = (e.currentTarget as HTMLElement).getAttribute('data-reportid');
            if (reportId) {
                viewReportDetails(reportId);
            }
        });
    });

    // Linked events button
    document.querySelectorAll('.events-btn[data-reportid]').forEach(button => {
        button.addEventListener('click', (e) => {
            const reportId = (e.currentTarget as HTMLElement).getAttribute('data-reportid');
            if (reportId) {
                showLinkedEvents(reportId);
            }
        });
    });
}

/**
 * Displays details of a specific incident report
 * @param reportId The ID of the report to display
 */
async function viewReportDetails(reportId: string) {
    try {
        const report = await getReportById(reportId);

        // Create a modal to show the report details
        const reportModal = createReportModal();
        const detailsDiv = document.getElementById('report-details');

        if (!detailsDiv) return;

        // Format timestamp
        const timestamp = report.createdat ? new Date(report.createdat).toLocaleString() : 'Unknown';

        detailsDiv.innerHTML = `
            <h3>${report.title || 'Untitled Report'}</h3>
            <div class="report-meta">
                <div><strong>Created:</strong> ${timestamp}</div>
                <div><strong>By:</strong> ${report.createdby?.id || 'Unknown User'}</div>
                <div><strong>Related Alert:</strong> ${report.relatedalertid?.id ? `Alert #${report.relatedalertid.id}` : 'None'}</div>
            </div>
            <div class="report-description">
                <h4>Description</h4>
                <p>${report.description || 'No description available'}</p>
            </div>
        `;

        // Show the modal
        reportModal.classList.add('active');

    } catch (error) {
        console.error('Error viewing report details:', error);
        alert(`Error viewing report details: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Shows events linked to a specific incident report
 * @param reportId The ID of the report to show linked events for
 */
async function showLinkedEvents(reportId: string) {
    try {
        const links = await getLinkedEvents(reportId);
        const report = await getReportById(reportId);

        // Create a modal to show the linked events
        const eventsModal = createLinkedEventsModal();
        const eventsListDiv = document.getElementById('linked-events-list');

        if (!eventsListDiv) return;

        // Set the title
        const modalTitle = document.getElementById('linked-events-title');
        if (modalTitle) {
            modalTitle.textContent = `Events Linked to Report: ${report.title || 'Untitled Report'}`;
        }

        if (links.length === 0) {
            eventsListDiv.innerHTML = '<div class="empty-message">No events linked to this report</div>';
        } else {
            // Create a table to display the linked events
            let eventsTable = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Event ID</th>
                            <th>Timestamp</th>
                            <th>File ID</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            links.forEach((link: any) => {
                const event = link.logeventid;
                const timestamp = event.timestamp ? new Date(event.timestamp * 1000).toLocaleString() : 'N/A';

                eventsTable += `
                    <tr>
                        <td>${event.id}</td>
                        <td>${timestamp}</td>
                        <td>${event.fileid?.id || 'N/A'}</td>
                        <td><button class="action-btn view-event-btn" data-eventid="${event.id}">View Event</button></td>
                    </tr>
                `;
            });

            eventsTable += `
                    </tbody>
                </table>
            `;

            eventsListDiv.innerHTML = eventsTable;

            // Add event listeners to view event buttons
            document.querySelectorAll('.view-event-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const eventId = (e.currentTarget as HTMLElement).getAttribute('data-eventid');
                    if (eventId) {
                        // Close the current modal
                        eventsModal.classList.remove('active');
                        // View the event (implement this function elsewhere)
                        // viewEventDetails(eventId);
                        alert(`View event ${eventId} (implement this functionality)`);
                    }
                });
            });
        }

        // Show the modal
        eventsModal.classList.add('active');

    } catch (error) {
        console.error('Error showing linked events:', error);
        alert(`Error showing linked events: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Helper function to show an error message
 * @param errorMessage The error message to display
 */
function showReportLoadError(errorMessage: string) {
    const incidentReportsTab = document.getElementById('tab-incident-reports');

    if (incidentReportsTab) {
        incidentReportsTab.innerHTML = `<div class="error">${errorMessage}</div>`;
    }
}

/**
 * Creates a modal for displaying report details
 */
function createReportModal() {
    let reportModal = document.getElementById('report-modal');

    if (!reportModal) {
        reportModal = document.createElement('div');
        reportModal.id = 'report-modal';
        reportModal.className = 'modal';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => {
            reportModal?.classList.remove('active');
        };

        const detailsDiv = document.createElement('div');
        detailsDiv.id = 'report-details';

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(detailsDiv);
        reportModal.appendChild(modalContent);

        document.body.appendChild(reportModal);

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === reportModal) {
                reportModal?.classList.remove('active');
            }
        });
    }

    return reportModal;
}

/**
 * Creates a modal for displaying linked events
 */
function createLinkedEventsModal() {
    let eventsModal = document.getElementById('linked-events-modal');

    if (!eventsModal) {
        eventsModal = document.createElement('div');
        eventsModal.id = 'linked-events-modal';
        eventsModal.className = 'modal';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => {
            eventsModal?.classList.remove('active');
        };

        const title = document.createElement('h3');
        title.id = 'linked-events-title';
        title.textContent = 'Linked Events';

        const eventsListDiv = document.createElement('div');
        eventsListDiv.id = 'linked-events-list';

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(eventsListDiv);
        eventsModal.appendChild(modalContent);

        document.body.appendChild(eventsModal);

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === eventsModal) {
                eventsModal?.classList.remove('active');
            }
        });
    }

    return eventsModal;
}