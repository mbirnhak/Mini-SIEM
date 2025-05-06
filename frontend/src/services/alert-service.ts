import { fetchApi } from './api';
import { Alert, AlertRule } from '../types';

// Function to load alerts for the alerts tab
export async function loadAlerts() {
    try {
        // Fetch the alerts data
        const response = await fetchApi('/alerts');
        const alerts = await response.json();
        console.log("Alerts data:", alerts);

        // Get the alerts tab element
        const alertsTab = document.getElementById('tab-alerts');
        if (!alertsTab) {
            console.error('Alerts tab element not found');
            return;
        }

        // Create a simplified table structure
        let tableHTML = `
        <div style="margin: 20px; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h2>Alerts Dashboard</h2>
            <div id="debug-info" style="background-color: #f8f9fa; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 5px;">
                Processing ${alerts.length} alerts...
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Alert ID</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Triggered At</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Rule ID</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Status</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Add rows for each alert
        if (alerts.length === 0) {
            tableHTML += `
                <tr>
                    <td colspan="5" style="padding: 12px; text-align: center; border-bottom: 1px solid #ddd;">No alerts found</td>
                </tr>
            `;
        } else {
            alerts.forEach((alert: Alert) => {
                // Format timestamp
                const timestamp = alert.triggeredat ?
                    new Date(alert.triggeredat * 1000).toLocaleString() : 'N/A';

                // Get status class
                const statusClass = getStatusClass(alert.status);

                // Add row
                tableHTML += `
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 12px;">${alert.id}</td>
                        <td style="padding: 12px;">${timestamp}</td>
                        <td style="padding: 12px;">${alert.ruleid?.id || 'Unknown'}</td>
                        <td style="padding: 12px;">
                            <span class="status-badge ${statusClass}" style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase;">
                                ${alert.status}
                            </span>
                        </td>
                        <td style="padding: 12px;">
                            <button class="view-btn" data-alertid="${alert.id}" style="margin-right: 8px; padding: 6px 12px; background: linear-gradient(135deg, #3498db, #2980b9); color: white; border: none; border-radius: 4px; cursor: pointer;">
                                View
                            </button>
                            <button class="update-status-btn" data-alertid="${alert.id}" style="padding: 6px 12px; background: linear-gradient(135deg, #f39c12, #d35400); color: white; border: none; border-radius: 4px; cursor: pointer;">
                                Update Status
                            </button>
                        </td>
                    </tr>
                `;
            });
        }

        // Close the table structure
        tableHTML += `
                </tbody>
            </table>
        </div>
        `;

        // Set the HTML content
        alertsTab.innerHTML = tableHTML;

        // Update debug info
        const debugInfo = document.getElementById('debug-info');
        if (debugInfo) {
            debugInfo.innerHTML = `
                <strong>Debug Info:</strong> Successfully processed ${alerts.length} alerts<br>
                <strong>Time:</strong> ${new Date().toLocaleString()}
            `;
        }

        // Add event listeners for action buttons
        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const alertId = (e.currentTarget as HTMLElement).getAttribute('data-alertid');
                if (alertId) {
                    viewAlertDetails(alertId);
                }
            });
        });

        document.querySelectorAll('.update-status-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const alertId = (e.currentTarget as HTMLElement).getAttribute('data-alertid');
                if (alertId) {
                    showUpdateAlertStatusModal(alertId);
                }
            });
        });

    } catch (error) {
        console.error('Error loading alerts:', error);
        const alertsTab = document.getElementById('tab-alerts');

        if (alertsTab) {
            alertsTab.innerHTML = `
                <div style="color: #e74c3c; text-align: center; padding: 20px; background: #fff5f5; border: 1px solid #ffdddd; border-radius: 4px; margin: 20px;">
                    Failed to load alerts: ${error instanceof Error ? error.message : String(error)}
                </div>
            `;
        }
    }
}

// Function to get status class
function getStatusClass(status: string): string {
    if (!status) return 'status-unknown';

    switch (status.toLowerCase()) {
        case 'open':
            return 'status-open';
        case 'investigating':
            return 'status-investigating';
        case 'resolved':
            return 'status-resolved';
        default:
            return 'status-unknown';
    }
}

// Function to view alert details
async function viewAlertDetails(alertId: string) {
    try {
        // Fetch alert details using the GET /api/alerts/{id} endpoint
        const response = await fetchApi(`/alerts/${alertId}`);
        const alert: Alert = await response.json();

        if (!alert) {
            console.error(`Alert with ID ${alertId} not found`);
            return;
        }

        // Create or get the alert details modal
        const alertDetailsModal = createAlertDetailsModal();
        const detailsDiv = document.getElementById('alert-details');

        if (!detailsDiv) {
            console.error('Alert details div not found in modal');
            return;
        }

        // Format timestamp
        const timestamp = alert.triggeredat ?
            new Date(alert.triggeredat * 1000).toLocaleString() : 'N/A';

        // Get rule details using the GET /api/alertrules/{id} endpoint
        let ruleDetails = '<div class="loading">Loading rule details...</div>';

        try {
            if (alert.ruleid && alert.ruleid.id) {
                const ruleResponse = await fetchApi(`/alertrules/${alert.ruleid.id}`);
                const rule: AlertRule = await ruleResponse.json();

                ruleDetails = `
                    <div class="rule-details">
                        <h4>Rule #${rule.id}: ${rule.name || 'Unnamed Rule'}</h4>
                        <p>${rule.description || 'No description available'}</p>
                        <div class="rule-meta">
                            <span class="rule-severity">Severity: ${rule.severity || 'Unknown'}</span>
                            <span class="rule-status">Status: ${rule.isactive ? 'Active' : 'Inactive'}</span>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error fetching rule details:', error);
            ruleDetails = '<div class="error">Failed to load rule details</div>';
        }

        // Populate the modal with alert details
        detailsDiv.innerHTML = `
            <div class="alert-header">
                <h3>Alert #${alert.id}</h3>
                <span class="status-badge ${getStatusClass(alert.status)}">${alert.status}</span>
            </div>
            
            <div class="alert-details-grid">
                <div class="detail-group">
                    <label>Triggered At:</label>
                    <span>${timestamp}</span>
                </div>
                
                <div class="detail-group">
                    <label>Alert Rule:</label>
                    ${ruleDetails}
                </div>
            </div>
            
            <div class="alert-actions">
                <button id="update-alert-status-btn" class="submit-btn">Update Status</button>
            </div>
        `;

        // Add event listener to update status button
        const updateStatusBtn = document.getElementById('update-alert-status-btn');
        if (updateStatusBtn) {
            updateStatusBtn.addEventListener('click', () => {
                alertDetailsModal.classList.remove('active');
                showUpdateAlertStatusModal(alertId);
            });
        }

        // Show the modal
        alertDetailsModal.classList.add('active');

    } catch (error) {
        console.error('Error fetching alert details:', error);
        alert(`Error fetching alert details: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// Function to create alert details modal if it doesn't exist
function createAlertDetailsModal() {
    let alertDetailsModal = document.getElementById('alert-details-modal');

    if (!alertDetailsModal) {
        alertDetailsModal = document.createElement('div');
        alertDetailsModal.id = 'alert-details-modal';
        alertDetailsModal.className = 'modal';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => {
            alertDetailsModal?.classList.remove('active');
        };

        const detailsDiv = document.createElement('div');
        detailsDiv.id = 'alert-details';

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(detailsDiv);
        alertDetailsModal.appendChild(modalContent);

        document.body.appendChild(alertDetailsModal);

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === alertDetailsModal) {
                alertDetailsModal?.classList.remove('active');
            }
        });
    }

    return alertDetailsModal;
}

// Function to show update alert status modal
function showUpdateAlertStatusModal(alertId: string) {
    let updateStatusModal = document.getElementById('update-status-modal');

    if (!updateStatusModal) {
        updateStatusModal = document.createElement('div');
        updateStatusModal.id = 'update-status-modal';
        updateStatusModal.className = 'modal';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => {
            updateStatusModal?.classList.remove('active');
        };

        const title = document.createElement('h2');
        title.textContent = 'Update Alert Status';

        const subtitle = document.createElement('p');
        subtitle.className = 'modal-subtitle';
        subtitle.textContent = `Update status for Alert #${alertId}`;

        // Create status selection
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';

        const label = document.createElement('label');
        label.setAttribute('for', 'status-select');
        label.textContent = 'New Status';

        // Create select element with the status options from the API
        // Based on AlertStatus enum in the Java controller
        const select = document.createElement('select');
        select.id = 'status-select';
        select.innerHTML = `
            <option value="Open">Open</option>
            <option value="Investigating">Investigating</option>
            <option value="Resolved">Resolved</option>
        `;

        formGroup.appendChild(label);
        formGroup.appendChild(select);

        // Create submit button
        const submitBtn = document.createElement('button');
        submitBtn.id = 'submit-status-update';
        submitBtn.className = 'submit-btn';
        submitBtn.textContent = 'Update Status';
        submitBtn.addEventListener('click', async () => {
            const newStatus = (document.getElementById('status-select') as HTMLSelectElement).value;
            await updateAlertStatus(alertId, newStatus);
            updateStatusModal?.classList.remove('active');
            loadAlerts(); // Reload alerts to refresh the list
        });

        // Assemble modal
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(subtitle);
        modalContent.appendChild(formGroup);
        modalContent.appendChild(submitBtn);

        updateStatusModal.appendChild(modalContent);
        document.body.appendChild(updateStatusModal);

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === updateStatusModal) {
                updateStatusModal?.classList.remove('active');
            }
        });
    } else {
        // Update subtitle for current alert ID
        const subtitle = updateStatusModal.querySelector('.modal-subtitle');
        if (subtitle) {
            subtitle.textContent = `Update status for Alert #${alertId}`;
        }

        // Reset any existing event listeners on submit button
        const oldSubmitBtn = document.getElementById('submit-status-update');
        if (oldSubmitBtn) {
            const newSubmitBtn = oldSubmitBtn.cloneNode(true);
            oldSubmitBtn.parentNode?.replaceChild(newSubmitBtn, oldSubmitBtn);

            newSubmitBtn.addEventListener('click', async () => {
                const newStatus = (document.getElementById('status-select') as HTMLSelectElement).value;
                await updateAlertStatus(alertId, newStatus);
                updateStatusModal?.classList.remove('active');
                loadAlerts(); // Reload alerts to refresh the list
            });
        }
    }

    // Show the modal
    updateStatusModal.classList.add('active');
}

// Function to update an alert's status using the PUT /api/alerts/{id}/status endpoint
async function updateAlertStatus(alertId: string, newStatus: string) {
    try {
        // Use the endpoint from the controller: PUT /api/alerts/{id}/status?status=newStatus
        const response = await fetchApi(`/alerts/${alertId}/status?status=${encodeURIComponent(newStatus)}`, {
            method: 'PUT'
        });

        if (response.ok) {
            alert(`Alert status updated to ${newStatus}`);
        } else {
            // Handle error responses based on the controller's error handling
            const errorData = await response.json().catch(() => null);
            if (errorData) {
                throw new Error(errorData);
            } else {
                throw new Error(`Failed to update alert status: ${response.status} ${response.statusText}`);
            }
        }
    } catch (error) {
        console.error('Error updating alert status:', error);
        alert(`Error updating alert status: ${error instanceof Error ? error.message : String(error)}`);
    }
}