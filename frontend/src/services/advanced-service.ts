// In services/advanced-service.ts
import { fetchApi } from './api';

export async function fetchComplexEventReport() {
    try {
        const response = await fetchApi('/events/complex-report');
        return await response.json();
    } catch (error) {
        console.error('Error fetching complex event report:', error);
        throw error;
    }
}

export async function fetchAlertSummaryByRule() {
    try {
        const response = await fetchApi('/alerts/summary-by-rule');
        return await response.json();
    } catch (error) {
        console.error('Error fetching alert summary by rule:', error);
        throw error;
    }
}

export async function fetchHighTrafficSources() {
    try {
        const response = await fetchApi('/events/high-traffic-sources');
        return await response.json();
    } catch (error) {
        console.error('Error fetching high traffic sources:', error);
        throw error;
    }
}

export async function fetchReportsWithCriticalEvents() {
    try {
        const response = await fetchApi('/incidents/reports/with-critical-events');
        return await response.json();
    } catch (error) {
        console.error('Error fetching reports with critical events:', error);
        throw error;
    }
}

export async function fetchFrequentlyTriggeredRules(minAlerts = 5) {
    try {
        const response = await fetchApi(`/alertrules/frequently-triggered?minAlerts=${minAlerts}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching frequently triggered rules:', error);
        throw error;
    }
}

export async function fetchActiveUsers(minActions = 3) {
    try {
        const response = await fetchApi(`/users/active-users?minActions=${minActions}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching active users:', error);
        throw error;
    }
}

export async function fetchReportsWithRelatedEvents(alertId) {
    try {
        const response = await fetchApi(`/incidents/reports/with-related-events?alertId=${alertId}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching reports with related events:', error);
        throw error;
    }
}