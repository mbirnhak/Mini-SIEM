import {fetchApi} from './api';
import {displayEvents} from '../components/events';

export async function fetchLatestEvents() {
    try {
        const limitSelect = document.getElementById('limit-select') as HTMLSelectElement;
        const limit = limitSelect?.value || '10';

        console.log("LIMIT", limit);
        const events_response = await fetchApi(`/events/logevents/latest?limit=${limit}`);
        const events = await events_response.json();
        displayEvents(events);
    } catch (error) {
        console.error('Error fetching events:', error);

        const eventsTableBody = document.getElementById('events-body');
        if (eventsTableBody) {
            eventsTableBody.innerHTML = `<tr><td colspan="7">Error loading events: ${(error as Error).message}</td></tr>`;
        }
    }
}

export async function fetchRawlineDetails(rawline: string) {
    try {
        const encodedRawline = encodeURIComponent(rawline);
        const response = await fetchApi(`/events/rawlines/${encodedRawline}`);
        return await response.json();
    } catch (error) {
        // Rethrow with a specific error property to indicate not found
        console.error('Error in fetchRawlineDetails:', error);
        throw new Error('RawlineNotFound');
    }
}