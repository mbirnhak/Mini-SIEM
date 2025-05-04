// In services/dashboard-service.ts
import { fetchAllStatistics } from './statistics-service';
import { Chart, registerables } from "chart.js";

// Register Chart.js components
Chart.register(...registerables);

export async function loadDashboardStatistics() {
    try {
        const homeTab = document.getElementById('tab-home');

        if (!homeTab) return;

        // Create the dashboard structure
        homeTab.innerHTML = `
            <div class="dashboard-container">
                <h1>Welcome to your SIEM Dashboard</h1>
                <div class="dashboard-grid">
                    <div class="chart-container">
                        <h2>Reports with Most Linked Events</h2>
                        <canvas id="reportsChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h2>Events by File</h2>
                        <canvas id="eventsByFileChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h2>Actions by Category</h2>
                        <canvas id="actionsByCategoryChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h2>Raw Lines by Action</h2>
                        <canvas id="rawlinesByActionChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h2>Devices by Operating System</h2>
                        <canvas id="devicesByOSChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h2>Devices by Location</h2>
                        <canvas id="devicesByLocationChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h2>Latest Alerts</h2>
                        <table class="data-table" id="alerts-table">
                            <thead>
                                <tr>
                                    <th>Alert ID</th>
                                    <th>Triggered At</th>
                                    <th>Rule ID</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="alerts-body">
                                <!-- Alerts will be populated here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Fetch statistics data
        const stats = await fetchAllStatistics();

        // Create the charts
        createCharts(stats);

        // Populate alerts table
        populateAlertsTable(stats.latestAlerts);

    } catch (error) {
        console.error('Error loading dashboard statistics:', error);
        const homeTab = document.getElementById('tab-home');
        if (homeTab) {
            homeTab.innerHTML = '<div class="error">Failed to load dashboard statistics</div>';
        }
    }
}

function createCharts(stats: any) {
    // Create Reports Chart - special handling for report data structure
    console.log("Stats most linked: ", stats.reportsWithMostLinked);
    const reportData = stats.reportsWithMostLinked.map((item: any) => {
        const [report, count] = item;
        return {
            label: report.title || `Report ${report.id}`,
            value: count,
            id: report.id
        };
    });
    createBarChart('reportsChart', reportData, 'Report Title', 'Number of Events');

    // Create Events by File Chart
    createBarChart('eventsByFileChart', stats.eventsByFile, 'File ID', 'Event Count');

    // Create Actions by Category Chart
    createPieChart('actionsByCategoryChart', stats.actionsByCategory, 'Category', 'Count');

    // Create Raw Lines by Action Chart (Top 10)
    const topRawLines = stats.rawlinesByAction.slice(0, 10);
    createBarChart('rawlinesByActionChart', topRawLines, 'Action', 'Count');

    // Create Devices by OS Chart
    createPieChart('devicesByOSChart', stats.devicesByOS, 'Operating System', 'Count');

    // Create Devices by Location Chart
    createPieChart('devicesByLocationChart', stats.devicesByLocation, 'Location', 'Count');
}

function createBarChart(canvasId: string, data: any[], labelKey: string, valueKey: string) {
    const ctx = document.getElementById(canvasId) as HTMLCanvasElement;

    let labels: string[] = [];
    let values: number[] = [];

    // Handle different data structures
    if (data[0] && typeof data[0] === 'object' && 'label' in data[0] && 'value' in data[0]) {
        // Already transformed data (from reports)
        labels = data.map(item => item.label);
        values = data.map(item => item.value);
    } else if (Array.isArray(data[0])) {
        // Array of arrays [value, count]
        labels = data.map(item => item[0]);
        values = data.map(item => item[1]);
    } else {
        // Object with key-value pairs
        labels = data.map(item => Object.keys(item)[0]);
        values = data.map(item => Object.values(item)[0] as number);
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: valueKey,
                data: values,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: labelKey
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: valueKey
                    }
                }
            }
        }
    });
}

function createPieChart(canvasId: string, data: any[], labelKey: string, valueKey: string) {
    const ctx = document.getElementById(canvasId) as HTMLCanvasElement;

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(item => item[0]),
            datasets: [{
                data: data.map(item => item[1]),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)',
                    'rgba(255, 159, 64, 0.5)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function populateAlertsTable(alerts: any[]) {
    const alertsBody = document.getElementById('alerts-body');
    if (!alertsBody) return;

    if (alerts.length === 0) {
        alertsBody.innerHTML = '<tr><td colspan="4">No recent alerts</td></tr>';
        return;
    }

    alertsBody.innerHTML = alerts.map(alert => `
        <tr>
            <td>${alert.id || alert.alertId || 'N/A'}</td>
            <td>${alert.triggeredat ? new Date(alert.triggeredat).toLocaleString() : 'N/A'}</td>
            <td>${alert.ruleid?.id || alert.ruleId || 'N/A'}</td>
            <td>${alert.status || 'N/A'}</td>
        </tr>
    `).join('');
}

// Hook this up to your tab system
export function setupHomeDashboard() {
    document.querySelector<HTMLButtonElement>('[data-tab="home"]')?.addEventListener('click', () => {
        loadDashboardStatistics();
    });

    // Load dashboard when page loads
    loadDashboardStatistics();
}