import { fetchApi, postApi } from './api';
import { Alertrule } from '../types';

/**
 * Loads all alert rules and displays them in the alert rules tab
 */
export async function loadAlertRules() {
    try {
        const response = await fetchApi('/alertrules');
        const alertRules = await response.json();
        const alertRulesTab = document.getElementById('tab-alert-rules');

        if (!alertRulesTab) {
            console.error('Alert rules tab element not found');
            return;
        }

        // Create table structure first
        alertRulesTab.innerHTML = `
        <div class="table-container" id="alert-rules-table-container">
          <table class="data-table" id="alert-rules-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="alert-rules-body">
              <!-- Alert rules will be loaded here -->
            </tbody>
          </table>
        </div>
        `;

        const alertRulesTableBody = document.getElementById('alert-rules-body');

        if (!alertRulesTableBody) {
            console.error('Alert rules table body element not found after creation');
            return;
        }

        // Process each alert rule and add to table
        alertRules.forEach((rule: Alertrule) => {
            const row = document.createElement('tr');

            // Extract alert rule details with fallbacks
            const name = rule.name || 'Unnamed Rule';
            const severity = rule.severity || 'UNKNOWN';
            const isActive = rule.isactive ? 'Active' : 'Inactive';
            const createdAt = rule.createdat ? new Date(rule.createdat).toLocaleString() : 'Unknown';

            // Add severity class for styling
            const severityClass = getSeverityClass(severity);

            row.innerHTML = `
  <td>${name}</td>
  <td><span class="severity-badge ${severityClass}">${severity}</span></td>
  <td><span class="status-badge ${isActive === 'Active' ? 'status-active' : 'status-inactive'}">${isActive}</span></td>
  <td>${createdAt}</td>
  <td>
    <button class="action-btn view-btn" data-ruleid="${rule.id}">View</button>
    <button class="action-btn alerts-btn" data-ruleid="${rule.id}">Alerts</button>
    <button class="action-btn toggle-btn" data-ruleid="${rule.id}" data-active="${rule.isactive}">${rule.isactive ? 'Deactivate' : 'Activate'}</button>
  </td>
`;

            alertRulesTableBody.appendChild(row);
        });

        // If no alert rules were found
        if (alertRules.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="5" class="empty-message">No alert rules found</td>';
            alertRulesTableBody.appendChild(emptyRow);
        }

        // Add event listeners for action buttons
        addRuleActionListeners();

    } catch (error) {
        console.error('Error loading alert rules:', error);
        const alertRulesTab = document.getElementById('tab-alert-rules');

        if (alertRulesTab) {
            alertRulesTab.innerHTML = '<div class="error">Failed to load alert rules</div>';
        }
    }
}

/**
 * Loads alert rules by severity level
 * @param severity The severity level to filter by
 */
export async function loadRulesBySeverity(severity: string) {
    try {
        const encodedSeverity = encodeURIComponent(severity);
        const response = await fetchApi(`/alertrules/severity/${encodedSeverity}`);
        const rules = await response.json();
        displayFilteredRules(rules, `${severity} Severity Rules`);
    } catch (error) {
        console.error(`Error loading rules by severity ${severity}:`, error);
        showRuleLoadError(`Failed to load rules by severity: ${severity}`);
    }
}

/**
 * Loads alert rules by active status
 * @param isActive Whether to load active or inactive rules
 */
export async function loadRulesByActiveStatus(isActive: boolean) {
    try {
        const response = await fetchApi(`/alertrules/active/${isActive}`);
        const rules = await response.json();
        displayFilteredRules(rules, `${isActive ? 'Active' : 'Inactive'} Rules`);
    } catch (error) {
        console.error(`Error loading ${isActive ? 'active' : 'inactive'} rules:`, error);
        showRuleLoadError(`Failed to load ${isActive ? 'active' : 'inactive'} rules`);
    }
}

/**
 * Gets frequently triggered alert rules
 * @param minAlerts Minimum number of alerts to consider a rule frequently triggered
 */
export async function loadFrequentlyTriggeredRules(minAlerts: number = 5) {
    try {
        const response = await fetchApi(`/alertrules/frequently-triggered?minAlerts=${minAlerts}`);
        const ruleData = await response.json();

        // Process the data into a more user-friendly format
        // The API returns Object[] with [ruleId, ruleName, alertCount]
        const frequentRules = ruleData.map((data: any[]) => {
            return {
                id: data[0],
                name: data[1],
                alertCount: data[2]
            };
        });

        displayFrequentRules(frequentRules, `Frequently Triggered Rules (>${minAlerts} alerts)`);
    } catch (error) {
        console.error('Error loading frequently triggered rules:', error);
        showRuleLoadError('Failed to load frequently triggered rules');
    }
}

/**
 * Gets a specific alert rule by ID
 * @param ruleId The ID of the rule to retrieve
 */
export async function getRuleById(ruleId: string) {
    try {
        const response = await fetchApi(`/alertrules/${ruleId}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch rule: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error getting rule ${ruleId}:`, error);
        throw error;
    }
}

/**
 * Gets alerts triggered by a specific rule
 * @param ruleId The ID of the rule to get alerts for
 */
export async function getAlertsByRule(ruleId: string) {
    try {
        const response = await fetchApi(`/alerts/rule/${ruleId}`);
        return await response.json();
    } catch (error) {
        console.error(`Error getting alerts for rule ${ruleId}:`, error);
        throw error;
    }
}

/**
 * Creates a new alert rule
 * @param ruleData The rule data to create
 */
export async function createAlertRule(ruleData: any) {
    try {
        const response = await postApi('/alertrules', ruleData);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create alert rule: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating alert rule:', error);
        throw error;
    }
}

/**
 * Toggles the active status of an alert rule
 * @param ruleId The ID of the rule to toggle
 * @param isActive The current active status of the rule
 */
export async function toggleRuleStatus(ruleId: string, isActive: boolean) {
    try {
        // First, get the current rule
        const rule = await getRuleById(ruleId);

        // Toggle the isactive property
        rule.isactive = !isActive;

        // Save the updated rule
        const response = await postApi('/alertrules', rule);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update rule status: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error toggling rule ${ruleId} status:`, error);
        throw error;
    }
}

/**
 * Displays filtered alert rules with a custom heading
 * @param rules The rules to display
 * @param heading The heading to show above the rules
 */
function displayFilteredRules(rules: Alertrule[], heading: string) {
    const alertRulesTab = document.getElementById('tab-alert-rules');

    if (!alertRulesTab) {
        console.error('Alert rules tab element not found');
        return;
    }

    // Create table structure with heading
    alertRulesTab.innerHTML = `
    <div class="filter-heading">${heading}</div>
    <div class="table-container" id="alert-rules-table-container">
      <table class="data-table" id="alert-rules-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="alert-rules-body">
          <!-- Filtered alert rules will be loaded here -->
        </tbody>
      </table>
    </div>
    `;

    const alertRulesTableBody = document.getElementById('alert-rules-body');

    if (!alertRulesTableBody) {
        console.error('Alert rules table body element not found after creation');
        return;
    }

    // Process each alert rule and add to table
    rules.forEach((rule: Alertrule) => {
        const row = document.createElement('tr');

        // Extract alert rule details with fallbacks
        const name = rule.name || 'Unnamed Rule';
        const severity = rule.severity || 'UNKNOWN';
        const isActive = rule.isactive ? 'Active' : 'Inactive';
        const createdAt = rule.createdat ? new Date(rule.createdat).toLocaleString() : 'Unknown';

        // Add severity class for styling
        const severityClass = getSeverityClass(severity);

        row.innerHTML = `
<td>${name}</td>
<td><span class="severity-badge ${severityClass}">${severity}</span></td>
<td><span class="status-badge ${isActive === 'Active' ? 'status-active' : 'status-inactive'}">${isActive}</span></td>
<td>${createdAt}</td>
<td>
  <button class="action-btn view-btn" data-ruleid="${rule.id}">View</button>
  <button class="action-btn alerts-btn" data-ruleid="${rule.id}">Alerts</button>
  <button class="action-btn toggle-btn" data-ruleid="${rule.id}" data-active="${rule.isactive}">${rule.isactive ? 'Deactivate' : 'Activate'}</button>
</td>
`;

        alertRulesTableBody.appendChild(row);
    });

    // If no alert rules were found
    if (rules.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="5" class="empty-message">No alert rules found</td>';
        alertRulesTableBody.appendChild(emptyRow);
    }

    // Add event listeners for action buttons
    addRuleActionListeners();
}

/**
 * Displays frequently triggered rules
 * @param rules The frequent rules data (with alert counts)
 * @param heading The heading to show above the rules
 */
function displayFrequentRules(rules: any[], heading: string) {
    const alertRulesTab = document.getElementById('tab-alert-rules');

    if (!alertRulesTab) {
        console.error('Alert rules tab element not found');
        return;
    }

    // Create table structure with heading
    alertRulesTab.innerHTML = `
    <div class="filter-heading">${heading}</div>
    <div class="table-container" id="alert-rules-table-container">
      <table class="data-table" id="alert-rules-table">
        <thead>
          <tr>
            <th>Rule Name</th>
            <th>Alert Count</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="alert-rules-body">
          <!-- Frequent rules will be loaded here -->
        </tbody>
      </table>
    </div>
    `;

    const alertRulesTableBody = document.getElementById('alert-rules-body');

    if (!alertRulesTableBody) {
        console.error('Alert rules table body element not found after creation');
        return;
    }

    // Process each frequent rule and add to table
    rules.forEach((rule) => {
        const row = document.createElement('tr');

        row.innerHTML = `
<td>${rule.name || 'Unnamed Rule'}</td>
<td>${rule.alertCount}</td>
<td>
  <button class="action-btn view-btn" data-ruleid="${rule.id}">View Rule</button>
  <button class="action-btn alerts-btn" data-ruleid="${rule.id}">View Alerts</button>
</td>
`;

        alertRulesTableBody.appendChild(row);
    });

    // If no rules were found
    if (rules.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="3" class="empty-message">No frequently triggered rules found</td>';
        alertRulesTableBody.appendChild(emptyRow);
    }

    // Add event listeners for action buttons
    document.querySelectorAll('.view-btn[data-ruleid]').forEach(button => {
        button.addEventListener('click', (e) => {
            const ruleId = (e.currentTarget as HTMLElement).getAttribute('data-ruleid');
            if (ruleId) {
                viewRuleDetails(ruleId);
            }
        });
    });

    document.querySelectorAll('.alerts-btn[data-ruleid]').forEach(button => {
        button.addEventListener('click', (e) => {
            const ruleId = (e.currentTarget as HTMLElement).getAttribute('data-ruleid');
            if (ruleId) {
                showRuleAlerts(ruleId);
            }
        });
    });
}

/**
 * Helper function to add event listeners to rule action buttons
 */
function addRuleActionListeners() {
    // View rule button
    document.querySelectorAll('.view-btn[data-ruleid]').forEach(button => {
        button.addEventListener('click', (e) => {
            const ruleId = (e.currentTarget as HTMLElement).getAttribute('data-ruleid');
            if (ruleId) {
                viewRuleDetails(ruleId);
            }
        });
    });

    // Alerts button
    document.querySelectorAll('.alerts-btn[data-ruleid]').forEach(button => {
        button.addEventListener('click', (e) => {
            const ruleId = (e.currentTarget as HTMLElement).getAttribute('data-ruleid');
            if (ruleId) {
                showRuleAlerts(ruleId);
            }
        });
    });

    // Toggle status button
    document.querySelectorAll('.toggle-btn[data-ruleid]').forEach(button => {
        button.addEventListener('click', async (e) => {
            const ruleId = (e.currentTarget as HTMLElement).getAttribute('data-ruleid');
            const isActiveStr = (e.currentTarget as HTMLElement).getAttribute('data-active');
            const isActive = isActiveStr === 'true';

            if (ruleId) {
                try {
                    await toggleRuleStatus(ruleId, isActive);
                    // Reload the rules to show the updated status
                    loadAlertRules();
                } catch (error) {
                    alert(`Error toggling rule status: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        });
    });
}

/**
 * Displays details of a specific alert rule
 * @param ruleId The ID of the rule to display
 */
async function viewRuleDetails(ruleId: string) {
    try {
        const rule = await getRuleById(ruleId);

        // Create a modal to show the rule details
        const ruleModal = createRuleModal();
        const detailsDiv = document.getElementById('rule-details');

        if (!detailsDiv) return;

        // Format timestamp
        const timestamp = rule.createdat ? new Date(rule.createdat).toLocaleString() : 'Unknown';

        // Format condition logic
        let conditionLogicHtml = '<p>No conditions defined</p>';
        if (rule.conditionlogic && Object.keys(rule.conditionlogic).length > 0) {
            conditionLogicHtml = `<pre>${JSON.stringify(rule.conditionlogic, null, 2)}</pre>`;
        }

        detailsDiv.innerHTML = `
            <h3>${rule.name || 'Unnamed Rule'}</h3>
            <div class="rule-meta">
                <div><strong>Severity:</strong> <span class="severity-badge ${getSeverityClass(rule.severity)}">${rule.severity}</span></div>
                <div><strong>Status:</strong> <span class="status-badge ${rule.isactive ? 'status-active' : 'status-inactive'}">${rule.isactive ? 'Active' : 'Inactive'}</span></div>
                <div><strong>Created:</strong> ${timestamp}</div>
                <div><strong>Created By:</strong> ${rule.createdby?.username || 'Unknown User'}</div>
            </div>
            <div class="rule-description">
                <h4>Description</h4>
                <p>${rule.description || 'No description available'}</p>
            </div>
            <div class="rule-conditions">
                <h4>Conditions</h4>
                ${conditionLogicHtml}
            </div>
        `;

        // Show the modal
        ruleModal.classList.add('active');

    } catch (error) {
        console.error('Error viewing rule details:', error);
        alert(`Error viewing rule details: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Shows alerts triggered by a specific rule
 * @param ruleId The ID of the rule to show alerts for
 */
async function showRuleAlerts(ruleId: string) {
    try {
        const alerts = await getAlertsByRule(ruleId);
        const rule = await getRuleById(ruleId);

        // Create a modal to show the alerts
        const alertsModal = createRuleAlertsModal();
        const alertsListDiv = document.getElementById('rule-alerts-list');

        if (!alertsListDiv) return;

        // Set the title
        const modalTitle = document.getElementById('rule-alerts-title');
        if (modalTitle) {
            modalTitle.textContent = `Alerts Triggered by Rule: ${rule.name || 'Unnamed Rule'}`;
        }

        if (alerts.length === 0) {
            alertsListDiv.innerHTML = '<div class="empty-message">No alerts have been triggered by this rule</div>';
        } else {
            // Create a table to display the alerts
            let alertsTable = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Alert ID</th>
                            <th>Triggered At</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            alerts.forEach((alert: any) => {
                const timestamp = alert.triggeredat ? new Date(alert.triggeredat * 1000).toLocaleString() : 'N/A';
                const statusClass = getStatusClass(alert.status);

                alertsTable += `
                    <tr>
                        <td>${alert.id}</td>
                        <td>${timestamp}</td>
                        <td><span class="status-badge ${statusClass}">${alert.status}</span></td>
                        <td><button class="action-btn view-alert-btn" data-alertid="${alert.id}">View Alert</button></td>
                    </tr>
                `;
            });

            alertsTable += `
                    </tbody>
                </table>
            `;

            alertsListDiv.innerHTML = alertsTable;

            // Add event listeners to view alert buttons
            document.querySelectorAll('.view-alert-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const alertId = (e.currentTarget as HTMLElement).getAttribute('data-alertid');
                    if (alertId) {
                        // Close the current modal
                        alertsModal.classList.remove('active');
                        // View the alert (implement this function elsewhere)
                        // viewAlertDetails(alertId);
                        alert(`View alert ${alertId} (implement this functionality)`);
                    }
                });
            });
        }

        // Show the modal
        alertsModal.classList.add('active');

    } catch (error) {
        console.error('Error showing rule alerts:', error);
        alert(`Error showing rule alerts: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Helper function to show an error message
 * @param errorMessage The error message to display
 */
function showRuleLoadError(errorMessage: string) {
    const alertRulesTab = document.getElementById('tab-alert-rules');

    if (alertRulesTab) {
        alertRulesTab.innerHTML = `<div class="error">${errorMessage}</div>`;
    }
}

/**
 * Gets a CSS class based on the severity level
 * @param severity The severity level
 * @returns The CSS class name
 */
function getSeverityClass(severity: string): string {
    switch (severity.toUpperCase()) {
        case 'HIGH':
            return 'severity-high';
        case 'MEDIUM':
            return 'severity-medium';
        case 'LOW':
            return 'severity-low';
        default:
            return 'severity-unknown';
    }
}

/**
 * Gets a CSS class based on the alert status
 * @param status The alert status
 * @returns The CSS class name
 */
function getStatusClass(status: string): string {
    switch (status.toUpperCase()) {
        case 'OPEN':
            return 'status-open';
        case 'INVESTIGATING':
            return 'status-investigating';
        case 'RESOLVED':
            return 'status-resolved';
        default:
            return 'status-unknown';
    }
}

/**
 * Creates a modal for displaying rule details
 */
function createRuleModal() {
    let ruleModal = document.getElementById('rule-modal');

    if (!ruleModal) {
        ruleModal = document.createElement('div');
        ruleModal.id = 'rule-modal';
        ruleModal.className = 'modal';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => {
            ruleModal?.classList.remove('active');
        };

        const detailsDiv = document.createElement('div');
        detailsDiv.id = 'rule-details';

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(detailsDiv);
        ruleModal.appendChild(modalContent);

        document.body.appendChild(ruleModal);

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === ruleModal) {
                ruleModal?.classList.remove('active');
            }
        });
    }

    return ruleModal;
}

/**
 * Creates a modal for displaying rule alerts
 */
function createRuleAlertsModal() {
    let alertsModal = document.getElementById('rule-alerts-modal');

    if (!alertsModal) {
        alertsModal = document.createElement('div');
        alertsModal.id = 'rule-alerts-modal';
        alertsModal.className = 'modal';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => {
            alertsModal?.classList.remove('active');
        };

        const title = document.createElement('h3');
        title.id = 'rule-alerts-title';
        title.textContent = 'Rule Alerts';

        const alertsListDiv = document.createElement('div');
        alertsListDiv.id = 'rule-alerts-list';

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(alertsListDiv);
        alertsModal.appendChild(modalContent);

        document.body.appendChild(alertsModal);

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === alertsModal) {
                alertsModal?.classList.remove('active');
            }
        });
    }

    return alertsModal;
}