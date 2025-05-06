import { fetchApi } from './api';
import { Threatintel } from '../types';

/**
 * Loads threat intelligence data and displays it in the threat intel tab
 */
export async function loadThreatIntel() {
    try {
        const response = await fetchApi('/threats');
        const threats = await response.json();
        const threatIntelTab = document.getElementById('tab-threat-intel');

        if (!threatIntelTab) {
            console.error('Threat intelligence tab element not found');
            return;
        }

        // Create table structure
        threatIntelTab.innerHTML = `
        <div class="table-container" id="threat-intel-table-container">
          <table class="data-table" id="threat-intel-table">
            <thead>
              <tr>
                <th>Indicator</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody id="threat-intel-body">
              <!-- Threat intelligence will be loaded here -->
            </tbody>
          </table>
        </div>
        `;

        const threatIntelTableBody = document.getElementById('threat-intel-body');

        if (!threatIntelTableBody) {
            console.error('Threat intel table body element not found after creation');
            return;
        }

        // Process each threat and add to table
        threats.forEach((threat: Threatintel) => {
            const row = document.createElement('tr');

            // Extract threat details with fallbacks
            const indicator = threat.indicator || 'Unknown Indicator';
            const type = threat.type || 'Unknown Type';
            const severity = threat.severity || 'Unknown';
            const description = threat.description || 'No description available';

            // Add severity class for styling
            const severityClass = getSeverityClass(severity);

            row.innerHTML = `
  <td>${indicator}</td>
  <td>${type}</td>
  <td><span class="severity-badge ${severityClass}">${severity}</span></td>
  <td>${description}</td>
`;

            threatIntelTableBody.appendChild(row);
        });

        // If no threats were found
        if (threats.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="4" class="empty-message">No threat intelligence found</td>';
            threatIntelTableBody.appendChild(emptyRow);
        }

    } catch (error) {
        console.error('Error loading threat intelligence:', error);
        const threatIntelTab = document.getElementById('tab-threat-intel');

        if (threatIntelTab) {
            threatIntelTab.innerHTML = '<div class="error">Failed to load threat intelligence</div>';
        }
    }
}

/**
 * Gets threat intelligence by a specific type
 * @param type The type of threat to filter by
 */
export async function loadThreatsByType(type: string) {
    try {
        const encodedType = encodeURIComponent(type);
        const response = await fetchApi(`/threats/type/${encodedType}`);
        const threats = await response.json();
        displayFilteredThreats(threats, `Threats of Type: ${type}`);
    } catch (error) {
        console.error(`Error loading threats by type ${type}:`, error);
        showThreatLoadError(`Failed to load threats by type: ${type}`);
    }
}

/**
 * Gets threat intelligence filtered by severity
 * @param severity The severity level to filter by
 */
export async function loadThreatsBySeverity(severity: string) {
    try {
        const encodedSeverity = encodeURIComponent(severity);
        const response = await fetchApi(`/threats/severity/${encodedSeverity}`);
        const threats = await response.json();
        displayFilteredThreats(threats, `${severity} Severity Threats`);
    } catch (error) {
        console.error(`Error loading threats by severity ${severity}:`, error);
        showThreatLoadError(`Failed to load threats by severity: ${severity}`);
    }
}

/**
 * Gets a specific threat by indicator
 * @param indicator The threat indicator to look up
 */
export async function getThreatByIndicator(indicator: string) {
    try {
        const encodedIndicator = encodeURIComponent(indicator);
        const response = await fetchApi(`/threats/indicator/${encodedIndicator}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch threat: ${response.statusText}`);
        }

        const threat = await response.json();
        return threat;
    } catch (error) {
        console.error(`Error getting threat by indicator ${indicator}:`, error);
        throw error;
    }
}

/**
 * Displays a filtered set of threats with a custom heading
 * @param threats The threats to display
 * @param heading The heading to show above the threats
 */
function displayFilteredThreats(threats: Threatintel[], heading: string) {
    const threatIntelTab = document.getElementById('tab-threat-intel');

    if (!threatIntelTab) {
        console.error('Threat intelligence tab element not found');
        return;
    }

    // Create table structure with heading
    threatIntelTab.innerHTML = `
    <div class="filter-heading">${heading}</div>
    <div class="table-container" id="threat-intel-table-container">
      <table class="data-table" id="threat-intel-table">
        <thead>
          <tr>
            <th>Indicator</th>
            <th>Type</th>
            <th>Severity</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody id="threat-intel-body">
          <!-- Filtered threats will be loaded here -->
        </tbody>
      </table>
    </div>
    `;

    const threatIntelTableBody = document.getElementById('threat-intel-body');

    if (!threatIntelTableBody) {
        console.error('Threat intel table body element not found after creation');
        return;
    }

    // Process each threat and add to table
    threats.forEach((threat: Threatintel) => {
        const row = document.createElement('tr');

        // Extract threat details with fallbacks
        const indicator = threat.indicator || 'Unknown Indicator';
        const type = threat.type || 'Unknown Type';
        const severity = threat.severity || 'Unknown';
        const description = threat.description || 'No description available';

        // Add severity class for styling
        const severityClass = getSeverityClass(severity);

        row.innerHTML = `
<td>${indicator}</td>
<td>${type}</td>
<td><span class="severity-badge ${severityClass}">${severity}</span></td>
<td>${description}</td>
`;

        threatIntelTableBody.appendChild(row);
    });

    // If no threats were found
    if (threats.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="4" class="empty-message">No threat intelligence found</td>';
        threatIntelTableBody.appendChild(emptyRow);
    }
}

/**
 * Helper function to show an error message
 * @param errorMessage The error message to display
 */
function showThreatLoadError(errorMessage: string) {
    const threatIntelTab = document.getElementById('tab-threat-intel');

    if (threatIntelTab) {
        threatIntelTab.innerHTML = `<div class="error">${errorMessage}</div>`;
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