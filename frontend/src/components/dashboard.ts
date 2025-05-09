import { fetchLatestEvents } from '../services/event-service.ts';
import { loadDevices } from '../services/device-service.ts';
import { loadLogFiles } from "../services/file-service.ts";
import { loadActions } from "../services/action-service.ts";
import { loadEventCategories } from "../services/category-service.ts";
import { loadAlerts } from "../services/alert-service.ts";
import { loadAdvancedReportsTab } from "./advanced.ts";
import {loadThreatIntel} from "../services/threat-intell-service.ts";
import {loadIncidentReports} from "../services/incident-report-service.ts";
import {loadAlertRules} from "../services/alert-rule-service.ts";
import {loadRawlines} from "../services/rawline-service.ts";

export function setupDashboard() {
    // Get elements
    const refreshBtn = document.getElementById('refresh-events');
    const limitSelect = document.getElementById('limit-select') as HTMLSelectElement;

    // Event listeners
    refreshBtn?.addEventListener('click', fetchLatestEvents);
    limitSelect?.addEventListener('change', fetchLatestEvents);

    // Set up devices tab
    document.querySelector<HTMLButtonElement>('[data-tab="devices"]')?.addEventListener('click', () => {
        showTab('tab-devices');
        loadDevices();
    });

    // Set up log files tab
    document.querySelector<HTMLButtonElement>('[data-tab="log-files"]')?.addEventListener('click', () => {
        showTab('tab-log-files');
        loadLogFiles();
    });

    // Set up actions tab
    document.querySelector<HTMLButtonElement>('[data-tab="actions"]')?.addEventListener('click', () => {
        showTab('tab-actions');
        loadActions();
    });

    // Set up event categories tab
    document.querySelector<HTMLButtonElement>('[data-tab="event-categories"]')?.addEventListener('click', () => {
        showTab('tab-event-categories');
        loadEventCategories();
    });

    // Set up alerts tab
    document.querySelector<HTMLButtonElement>('[data-tab="alerts"]')?.addEventListener('click', () => {
        showTab('tab-alerts');
        loadAlerts();
    });

    // Set up advanced reports tab
    document.querySelector<HTMLButtonElement>('[data-tab="advanced-reports"]')?.addEventListener('click', () => {
        showTab('tab-advanced-reports');
        loadAdvancedReportsTab();
    });

    document.querySelector<HTMLButtonElement>('[data-tab="threat-intel"]')?.addEventListener('click', () => {
        showTab('tab-threat-intel');
        loadThreatIntel();
    });

    document.querySelector<HTMLButtonElement>('[data-tab="incident-reports"]')?.addEventListener('click', () => {
        showTab('tab-incident-reports');
        loadIncidentReports();
    });

    document.querySelector<HTMLButtonElement>('[data-tab="alert-rules"]')?.addEventListener('click', () => {
        showTab('tab-alert-rules');
        loadAlertRules();
    });

    document.querySelector<HTMLButtonElement>('[data-tab="rawlines"]')?.addEventListener('click', () => {
        showTab('tab-rawlines');
        loadRawlines();
    });
}

// Helper function to show the selected tab and hide others
function showTab(tabId: string) {
    // Hide all tab panels first
    document.querySelectorAll('.tab-panel').forEach(panel => {
        (panel as HTMLElement).style.display = 'none';
    });

    // Show the selected tab panel
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.style.display = 'block';
    }

    // Update active tab in navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    const activeTabButton = document.querySelector(`[data-tab="${tabId.replace('tab-', '')}"]`);
    if (activeTabButton) {
        activeTabButton.classList.add('active');
    }
}

export function showDashboard() {
    const authSection = document.getElementById('auth-section') as HTMLElement;
    const dashboard = document.getElementById('dashboard') as HTMLElement;

    authSection.style.display = 'none';
    dashboard.style.display = 'block';

    // Fetch events when dashboard is shown
    fetchLatestEvents();
}