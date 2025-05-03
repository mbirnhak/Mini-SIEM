import { fetchLatestEvents } from '../services/event-service.ts';
import { loadDevices } from '../services/device-service.ts';

export function setupDashboard() {
    // Get elements
    const refreshBtn = document.getElementById('refresh-events');
    const limitSelect = document.getElementById('limit-select') as HTMLSelectElement;

    // Event listeners
    refreshBtn?.addEventListener('click', fetchLatestEvents);
    limitSelect?.addEventListener('change', fetchLatestEvents);

    // Set up devices tab
    document.querySelector<HTMLButtonElement>('[data-tab="devices"]')?.addEventListener('click', () => {
        const devicesTab = document.getElementById('tab-devices')!;
        devicesTab.style.display = 'block';
        loadDevices();
    });
}

export function showDashboard() {
    const authSection = document.getElementById('auth-section') as HTMLElement;
    const dashboard = document.getElementById('dashboard') as HTMLElement;

    authSection.style.display = 'none';
    dashboard.style.display = 'block';

    // Fetch events when dashboard is shown
    fetchLatestEvents();
}