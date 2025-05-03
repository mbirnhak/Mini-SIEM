import { fetchRawlineDetails } from '../services/event-service.ts';
import { createRawlineModal } from './modal.ts';
import { extractValue } from '../utils/helpers.ts';

export function displayEvents(eventsData: any) {
    const eventsTableBody = document.getElementById('events-body') as HTMLElement;

    // Handle different possible response formats
    let events: any[] = [];

    if (!eventsData) {
        eventsTableBody.innerHTML = '<tr><td colspan="7">No events found</td></tr>';
        return;
    }

    // If eventsData is already an array, use it directly
    if (Array.isArray(eventsData)) {
        events = eventsData;
    }
    // If eventsData has a results, data, or events property that's an array, use that
    else if (Array.isArray(eventsData.results)) {
        events = eventsData.results;
    } else if (Array.isArray(eventsData.data)) {
        events = eventsData.data;
    } else if (Array.isArray(eventsData.events)) {
        events = eventsData.events;
    }
    // If eventsData is a single event object, wrap it in an array
    else if (typeof eventsData === 'object' && eventsData.id) {
        events = [eventsData];
    }

    // Check if we managed to extract an array of events
    if (events.length === 0) {
        eventsTableBody.innerHTML = '<tr><td colspan="7">No events found</td></tr>';
        console.log('Response format not recognized:', eventsData);
        return;
    }

    eventsTableBody.innerHTML = '';

    events.forEach(event => {
        const row = document.createElement('tr');

        // Format timestamp - convert from Unix timestamp to date
        const timestamp = event.timestamp ?
            new Date(event.timestamp * 1000).toLocaleString() : 'N/A';

        // Get the raw log line
        const rawLine = event.rawline?.rawline || 'No raw line';

        // Extract file ID
        const fileId = event.fileid?.id || 'N/A';

        // Alert ID if available
        const alertId = event.associatedalertid?.id || 'N/A';

        row.innerHTML = `
      <td>${event.id}</td>
      <td>${timestamp}</td>
      <td>File ${fileId}</td>
      <td class="placeholder-data">Loading...</td>
      <td><a href="#" class="rawline-link" data-rawline="${encodeURIComponent(rawLine)}">${rawLine}</a></td>
      <td class="placeholder-data">Loading...</td>
      <td>${alertId !== 'N/A' ? `Alert ${alertId}` : 'No alert'}</td>
    `;

        eventsTableBody.appendChild(row);
    });

    // Add event listeners to all rawline links
    addRawlineLinkListeners();
}

function addRawlineLinkListeners() {
    const rawlineLinks = document.querySelectorAll('.rawline-link');

    rawlineLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const rawline = decodeURIComponent(link.getAttribute('data-rawline') || '');
            showRawlineDetails(rawline, link);
        });
    });
}

async function showRawlineDetails(rawline: string, linkElement: Element) {
    try {
        const data = await fetchRawlineDetails(rawline);

        // Create or show modal with the parsed data
        showRawlineModal(data, rawline);

        // Update the placeholders in the same row as the clicked link
        updateRowWithParsedData(linkElement, data);
    } catch (error) {
        console.error('Error fetching rawline details:', error);
        alert(`Error fetching details: ${error instanceof Error ? error.message : String(error)}`);
    }
}

function updateRowWithParsedData(linkElement: Element, data: any) {
    const row = linkElement.closest('tr');
    if (!row) return;

    // Find the action and source/destination cells in this row
    const actionCell = row.querySelector('td:nth-child(4)');
    const sourceDestCell = row.querySelector('td:nth-child(6)');

    if (actionCell) {
        actionCell.textContent = extractValue(data.action);
        actionCell.classList.remove('placeholder-data');
    }

    if (sourceDestCell) {
        const source = data.sourcedeviceid ? `Device ${extractValue(data.sourcedeviceid)}` : 'N/A';
        const sourcePort = data.sourceport ? `:${data.sourceport}` : '';
        const destination = data.destinationdeviceid ? `Device ${extractValue(data.destinationdeviceid)}` : 'N/A';
        const destPort = data.destinationport ? `:${data.destinationport}` : '';

        sourceDestCell.textContent = `${source}${sourcePort} → ${destination}${destPort}`;
        sourceDestCell.classList.remove('placeholder-data');
    }
}

function showRawlineModal(data: any, rawline: string) {
    // Create or get the modal
    const rawlineModal = createRawlineModal();

    // Update modal content with the parsed data
    const detailsDiv = document.getElementById('rawline-details');
    if (!detailsDiv) return;

    // Extract action value
    const actionValue = extractValue(data.action);

    // Extract source information
    let sourceInfo = 'N/A';
    if (data.sourcedeviceid) {
        const deviceId = extractValue(data.sourcedeviceid);
        sourceInfo = `Device ID: ${deviceId}`;
        if (data.sourceport) {
            sourceInfo += `, Port: ${data.sourceport}`;
        }
    }

    // Extract destination information
    let destInfo = 'N/A';
    if (data.destinationdeviceid) {
        const deviceId = extractValue(data.destinationdeviceid);
        destInfo = `Device ID: ${deviceId}`;
        if (data.destinationport) {
            destInfo += `, Port: ${data.destinationport}`;
        }
    }

    let content = `
    <div class="rawline-original">
      <h3>Original Raw Line</h3>
      <pre>${rawline}</pre>
    </div>
    <div class="rawline-parsed">
      <h3>Parsed Details</h3>
      <table>
        <tr>
          <th>Action</th>
          <td>${actionValue}</td>
        </tr>
        <tr>
          <th>Source</th>
          <td>${sourceInfo}</td>
        </tr>
        <tr>
          <th>Destination</th>
          <td>${destInfo}</td>
        </tr>
        <tr>
          <th>Message</th>
          <td>${data.message || 'N/A'}</td>
        </tr>
      `;

    // Add additional parsed data if available
    if (data.parseddata) {
        content += `
      <tr>
        <th>Additional Data</th>
        <td><pre>${JSON.stringify(data.parseddata, null, 2)}</pre></td>
      </tr>
      `;
    }

    content += `
      </table>
    </div>
  `;

    detailsDiv.innerHTML = content;

    // Show the modal
    rawlineModal.style.display = 'block';
}