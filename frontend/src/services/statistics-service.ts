// In services/statistics-service.ts
import { fetchApi } from './api';

export async function fetchAllStatistics() {
    try {
        // Fetch reports with most linked events
        const reportsWithMostLinked = await fetchApi('/incidents/reports/most-linked?page=0&size=5');

        // Fetch event counts by file
        const eventsByFile = await fetchApi('/events/stats/events-by-file');

        // Fetch action counts by category
        const actionsByCategory = await fetchApi('/events/stats/actions-by-category');

        // Fetch raw line counts by action
        const rawlinesByAction = await fetchApi('/events/stats/rawlines-by-action');

        // Fetch top 3 most recent alerts
        const latestAlerts = await fetchApi('/alerts/latest?limit=3');

        // Fetch device statistics
        const devicesByOS = await fetchApi('/devices/count/os');
        const devicesByLocation = await fetchApi('/devices/count/location');
        const devicesByType = await fetchApi('/devices/count/type');

        return {
            reportsWithMostLinked: await reportsWithMostLinked.json(),
            eventsByFile: await eventsByFile.json(),
            actionsByCategory: await actionsByCategory.json(),
            rawlinesByAction: await rawlinesByAction.json(),
            latestAlerts: await latestAlerts.json(),
            devicesByOS: await devicesByOS.json(),
            devicesByLocation: await devicesByLocation.json(),
            devicesByType: await devicesByType.json()
        };
    } catch (error) {
        console.error('Error fetching statistics:', error);
        throw error;
    }
}