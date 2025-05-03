import { fetchLatestEvents } from '../services/event-service.ts';
import { loadDevices } from '../services/device-service.ts';
import {loadLogFiles} from "../services/file-service.ts";
import {loadActions} from "../services/action-service.ts";
import {loadEventCategories} from "../services/category-service.ts";

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
}

export function showDashboard() {
    const authSection = document.getElementById('auth-section') as HTMLElement;
    const dashboard = document.getElementById('dashboard') as HTMLElement;

    authSection.style.display = 'none';
    dashboard.style.display = 'block';

    // Fetch events when dashboard is shown
    fetchLatestEvents();
}