import { fetchRawlineDetails } from '../services/event-service.ts';
import { createRawlineModal } from './modal.ts';
import { extractValue } from '../utils/helpers.ts';
import {viewLogFile} from "../services/file-service.ts";
import {fetchApi, postApi} from "../services/api.ts";

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
      <td><a href="#" class="file-link" data-fileid="${fileId}">File ${fileId}</a></td>
      <td class="placeholder-data">Loading...</td>
      <td><a href="#" class="rawline-link" data-rawline="${encodeURIComponent(rawLine)}">${rawLine}</a></td>
      <td class="placeholder-data">Loading...</td>
      <td>${alertId !== 'N/A' ? `Alert ${alertId}` : 'No alert'}</td>
    `;

        eventsTableBody.appendChild(row);
    });

    // Add event listeners to all rawline links
    addRawlineLinkListeners();

    // Add event listeners to all file links.
    addFileLinkListeners();
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

function addFileLinkListeners() {
    const fileLinks = document.querySelectorAll('.file-link');

    fileLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const fileId = link.getAttribute('data-fileid') || '';
            if (fileId && fileId !== 'N/A') {
                // Call the viewLogFile function from your logfile service
                viewLogFile(fileId);
            }
        });
    });
}

async function showRawlineDetails(rawline: string, linkElement: Element) {
    try {
        const data = await fetchRawlineDetails(rawline);

        // If the API returned an error or empty result
        if (data.error || Object.keys(data).length === 0) {
            handleMissingRawline(rawline, linkElement);
            return;
        }

        // Raw line exists, show details as normal
        showRawlineModal(data, rawline);
        updateRowWithParsedData(linkElement, data);
    } catch (error) {
        console.error('Error fetching rawline details:', error);

        // If it's our specific not found error
        if (error instanceof Error && error.message === 'RawlineNotFound') {
            handleMissingRawline(rawline, linkElement);
        } else {
            // For other errors, show an alert
            alert(`Error fetching details: ${error instanceof Error ? error.message : String(error)}`);
            updateRowWithEmptyData(linkElement);
        }
    }
}

// New helper function to handle missing raw lines
function handleMissingRawline(rawline: string, linkElement: Element) {
    const shouldInsert = confirm('This raw log line is not in the database. Would you like to insert it?');

    if (shouldInsert) {
        insertRawline(rawline)
            .then(() => {
                // Try fetching again after insertion
                return fetchRawlineDetails(rawline);
            })
            .then(updatedData => {
                showRawlineModal(updatedData, rawline);
                updateRowWithParsedData(linkElement, updatedData);
            })
            .catch(insertError => {
                console.error('Error after inserting raw line:', insertError);
                alert(`Failed to process raw line: ${insertError instanceof Error ? insertError.message : String(insertError)}`);
                updateRowWithEmptyData(linkElement);
            });
    } else {
        // User chose not to insert, update row with N/A values
        updateRowWithEmptyData(linkElement);
    }
}

// Function to update the row with N/A values when raw line isn't found or not inserted
function updateRowWithEmptyData(linkElement: Element) {
    const row = linkElement.closest('tr');
    if (!row) return;

    // Find the action and source/destination cells in this row
    const actionCell = row.querySelector('td:nth-child(4)');
    const sourceDestCell = row.querySelector('td:nth-child(6)');

    if (actionCell) {
        actionCell.textContent = 'N/A';
        actionCell.classList.remove('placeholder-data');
    }

    if (sourceDestCell) {
        sourceDestCell.textContent = 'N/A';
        sourceDestCell.classList.remove('placeholder-data');
    }
}

// Function to insert a new raw line into the database
async function insertRawline(rawline: string) {
    try {
        // Parse the raw line to extract relevant information
        const parsedData = parseRawLine(rawline);

        // Check if action exists in the database (if an action was identified)
        let actionExists = false;
        let actionId = null;

        if (parsedData.action) {
            try {
                const actionResponse = await fetchApi(`/events/actions/${encodeURIComponent(parsedData.action)}`);
                actionExists = actionResponse.ok;
                if (actionExists) {
                    const actionData = await actionResponse.json();
                    actionId = actionData.action;
                }
            } catch (error) {
                console.error('Error checking action:', error);
            }
        }

        // Check if source device exists (if identified)
        let sourceDeviceExists = false;
        let sourceDeviceId = null;

        if (parsedData.additionalData.sourceIp || parsedData.additionalData.hostname) {
            try {
                // Try IP check first if available
                if (parsedData.additionalData.sourceIp) {
                    // Validate IP format using regex
                    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
                    if (ipRegex.test(parsedData.additionalData.sourceIp)) {
                        const sourceDeviceResponse = await fetchApi(`/devices/ip?ip=${encodeURIComponent(parsedData.additionalData.sourceIp)}`);
                        console.log(`Checking source device with IP: ${parsedData.additionalData.sourceIp}`);
                        if (sourceDeviceResponse.ok) {
                            console.log("Source Repsonse: ", sourceDeviceResponse)
                            const deviceData = await sourceDeviceResponse.json();
                            // Check if we got a valid device back
                            if (deviceData && deviceData.id) {
                                sourceDeviceExists = true;
                                sourceDeviceId = deviceData.id;
                                console.log(`Found device by IP: ${sourceDeviceId}`);
                            }
                        }
                    } else {
                        console.warn(`Invalid IP format: ${parsedData.additionalData.sourceIp}`);
                    }
                }

                // If we didn't find a device by IP, try hostname
                if (!sourceDeviceExists && parsedData.additionalData.hostname) {
                    const sourceDeviceResponse = await fetchApi(`/devices/hostname?hostname=${encodeURIComponent(parsedData.additionalData.hostname)}`);

                    if (sourceDeviceResponse.ok) {
                        const deviceData = await sourceDeviceResponse.json();
                        // Check if we got a valid device back
                        if (deviceData && deviceData.id) {
                            sourceDeviceExists = true;
                            sourceDeviceId = deviceData.id;
                            console.log(`Found device by hostname: ${sourceDeviceId}`);
                        }
                    }
                }
            } catch (error) {
                console.error('Error checking source device:', error);
            }
        }

        // Check if destination device exists (if identified)
        let destinationDeviceExists = false;
        let destinationDeviceId = null;

        // Check for destination device info in the parsed data
        if (parsedData.additionalData.destinationIp || parsedData.additionalData.destinationHostname) {
            try {
                // Try IP check first if available
                if (parsedData.additionalData.destinationIp) {
                    // Validate IP format using regex
                    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
                    if (ipRegex.test(parsedData.additionalData.destinationIp)) {
                        const destDeviceResponse = await fetchApi(`/devices/ip?ip=${encodeURIComponent(parsedData.additionalData.destinationIp)}`);

                        if (destDeviceResponse.ok) {
                            const deviceData = await destDeviceResponse.json();
                            // Check if we got a valid device back
                            if (deviceData && deviceData.id) {
                                destinationDeviceExists = true;
                                destinationDeviceId = deviceData.id;
                                console.log(`Found destination device by IP: ${destinationDeviceId}`);
                            }
                        }
                    } else {
                        console.warn(`Invalid destination IP format: ${parsedData.additionalData.destinationIp}`);
                    }
                }

                // If we didn't find a device by IP, try hostname
                if (!destinationDeviceExists && parsedData.additionalData.destinationHostname) {
                    const destDeviceResponse = await fetchApi(`/devices/hostname?hostname=${encodeURIComponent(parsedData.additionalData.destinationHostname)}`);

                    if (destDeviceResponse.ok) {
                        const deviceData = await destDeviceResponse.json();
                        // Check if we got a valid device back
                        if (deviceData && deviceData.id) {
                            destinationDeviceExists = true;
                            destinationDeviceId = deviceData.id;
                            console.log(`Found destination device by hostname: ${destinationDeviceId}`);
                        }
                    }
                }
            } catch (error) {
                console.error('Error checking destination device:', error);
            }
        }

        // Build a confirmation message for the user
        let confirmMessage = 'This raw log line requires some additional information before it can be inserted:';
        let needsConfirmation = false;

        if (parsedData.action && !actionExists) {
            confirmMessage += `\n- Action "${parsedData.action}" does not exist in the database.`;
            needsConfirmation = true;
        }

        if (parsedData.additionalData.sourceIp && !sourceDeviceExists) {
            confirmMessage += `\n- Source device with IP ${parsedData.additionalData.sourceIp} does not exist in the database.`;
            needsConfirmation = true;
        } else if (parsedData.additionalData.hostname && !sourceDeviceExists) {
            confirmMessage += `\n- Source device with hostname ${parsedData.additionalData.hostname} does not exist in the database.`;
            needsConfirmation = true;
        }

        if (parsedData.additionalData.destinationIp && !destinationDeviceExists) {
            confirmMessage += `\n- Destination device with IP ${parsedData.additionalData.destinationIp} does not exist in the database.`;
            needsConfirmation = true;
        } else if (parsedData.additionalData.destinationHostname && !destinationDeviceExists) {
            confirmMessage += `\n- Destination device with hostname ${parsedData.additionalData.destinationHostname} does not exist in the database.`;
            needsConfirmation = true;
        }

        confirmMessage += '\n\nWould you like to create these missing references and then insert the raw line?';

        // If any references are missing, ask the user for confirmation
        if (needsConfirmation) {
            const userConfirmed = confirm(confirmMessage);

            if (!userConfirmed) {
                // User chose not to create references, so return without inserting
                return null;
            }

            // User confirmed, so create the missing references

            // Create action if needed
            if (parsedData.action && !actionExists) {
                try {
                    const newAction = {
                        action: parsedData.action,
                        categoryname: null // You could add a category selection here in a more sophisticated UI
                    };

                    const actionResponse = await postApi('/events/actions', newAction);

                    if (actionResponse.ok) {
                        const createdAction = await actionResponse.json();
                        actionId = createdAction.action;
                    } else {
                        throw new Error(`Failed to create action: ${actionResponse.status} ${actionResponse.statusText}`);
                    }
                } catch (error) {
                    console.error('Error creating action:', error);
                    alert('Failed to create the action. The raw line will be inserted without an action reference.');
                }
            }

            // Create source device if needed
            if ((parsedData.additionalData.sourceIp || parsedData.additionalData.hostname) && !sourceDeviceExists) {
                try {
                    const newDevice = {
                        ipaddress: parsedData.additionalData.sourceIp || null,
                        hostname: parsedData.additionalData.hostname || 'unknown-host',
                        operatingsystem: 'Unknown', // Default value
                        location: 'Unknown',        // Default value
                        devicetype: 'Unknown'       // Default value
                    };

                    const deviceResponse = await postApi('/devices', newDevice);

                    if (deviceResponse.ok) {
                        const createdDevice = await deviceResponse.json();
                        sourceDeviceId = createdDevice.id;
                    } else {
                        throw new Error(`Failed to create device: ${deviceResponse.status} ${deviceResponse.statusText}`);
                    }
                } catch (error) {
                    console.error('Error creating source device:', error);
                    alert('Failed to create the source device. The raw line will be inserted without a source device reference.');
                }
            }

            // Create destination device if needed
            if ((parsedData.additionalData.destinationIp || parsedData.additionalData.destinationHostname) && !destinationDeviceExists) {
                try {
                    const newDestDevice = {
                        ipaddress: parsedData.additionalData.destinationIp || null,
                        hostname: parsedData.additionalData.destinationHostname || 'unknown-host',
                        operatingsystem: 'Unknown',
                        location: 'Unknown',
                        devicetype: 'Unknown'
                    };

                    const deviceResponse = await postApi('/devices', newDestDevice);

                    if (deviceResponse.ok) {
                        const createdDevice = await deviceResponse.json();
                        destinationDeviceId = createdDevice.id;
                    } else {
                        throw new Error(`Failed to create destination device: ${deviceResponse.status} ${deviceResponse.statusText}`);
                    }
                } catch (error) {
                    console.error('Error creating destination device:', error);
                    alert('Failed to create the destination device. The raw line will be inserted without a destination device reference.');
                }
            }
        }

        // Now create the raw line with the references we have
        const rawlineData = {
            rawline: rawline,
            sourcedeviceid: sourceDeviceId ? { id: sourceDeviceId } : null,
            sourceport: parsedData.sourcePort,
            destinationdeviceid: destinationDeviceId ? { id: destinationDeviceId } : null,
            destinationport: parsedData.destinationPort,
            action: actionId ? { action: actionId } : null,
            message: parsedData.message || "Auto-inserted raw line",
            parseddata: parsedData.additionalData || null
        };

        // Send POST request to create the raw line
        const response = await postApi('/events/rawlines', rawlineData);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to insert raw line: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error inserting raw line:', error);
        throw error;
    }
}

interface AdditionalData {
    hostname?: string;
    destinationHostname?: string;
    timestamp?: string;
    url?: string;
    statusCode?: string;
    sourceIp?: string;
    destinationIp?: string;
    username?: string;
    failureReason?: string;
}

// Function to parse raw log lines and extract structured information
function parseRawLine(rawline: string) {
    const result = {
        sourceDeviceId: null as number | null,
        sourcePort: null as number | null,
        destinationDeviceId: null as number | null,
        destinationPort: null as number | null,
        action: null as string | null,
        message: null as string | null,
        additionalData: {} as AdditionalData
    };

    // Check for timestamp and hostname pattern
    const timestampHostnameMatch = rawline.match(/^(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+([^:]+):/);
    if (timestampHostnameMatch) {
        // Extract the hostname (could be source device)
        const hostname = timestampHostnameMatch[2];
        result.additionalData.hostname = hostname;
        result.additionalData.timestamp = timestampHostnameMatch[1];
    }

    // Look for HTTP requests
    const httpMatch = rawline.match(/(GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH)\s+(\S+)\s+-\s+(\d{3})/i);
    if (httpMatch) {
        result.action = httpMatch[1]; // HTTP method as action
        result.additionalData.url = httpMatch[2];
        result.additionalData.statusCode = httpMatch[3];
        result.message = `HTTP ${httpMatch[1]} request to ${httpMatch[2]} returned ${httpMatch[3]}`;
    }

    // Look for source IP addresses
    const sourceIpMatch = rawline.match(/Source IP:\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::(\d+))?/i);
    if (sourceIpMatch) {
        // We don't have the device ID, but we have the IP
        result.additionalData.sourceIp = sourceIpMatch[1];
        if (sourceIpMatch[2]) {
            result.sourcePort = parseInt(sourceIpMatch[2], 10);
        }
    }

    // Look for destination IP addresses
    const destIpMatch = rawline.match(/Destination IP:\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::(\d+))?/i);
    if (destIpMatch) {
        result.additionalData.destinationIp = destIpMatch[1];
        if (destIpMatch[2]) {
            result.destinationPort = parseInt(destIpMatch[2], 10);
        }
    }

    // Look for connection patterns (source to destination)
    const connectionMatch = rawline.match(/Connection from (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::(\d+))? to (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::(\d+))?/i);
    if (connectionMatch) {
        result.additionalData.sourceIp = connectionMatch[1];
        if (connectionMatch[2]) {
            result.sourcePort = parseInt(connectionMatch[2], 10);
        }
        result.additionalData.destinationIp = connectionMatch[3];
        if (connectionMatch[4]) {
            result.destinationPort = parseInt(connectionMatch[4], 10);
        }
    }

    // Look for login attempts
    const loginMatch = rawline.match(/User\s+(\S+)\s+failed\s+login\s+attempt/i);
    if (loginMatch) {
        result.action = "LOGIN_FAILED";
        result.additionalData.username = loginMatch[1];
        result.message = `Failed login attempt for user ${loginMatch[1]}`;

        // Extract reason if available
        const reasonMatch = rawline.match(/Reason:\s+(.+?)(?:$|-)/i);
        if (reasonMatch) {
            result.additionalData.failureReason = reasonMatch[1].trim();
            result.message += ` - Reason: ${reasonMatch[1].trim()}`;
        }
    }

    // If we couldn't extract a specific message, use the raw line itself
    if (!result.message) {
        result.message = rawline;
    }

    return result;
}

function updateRowWithParsedData(linkElement: Element, data: any) {
    const row = linkElement.closest('tr');
    if (!row) return;

    // Find the action and source/destination cells in this row
    const actionCell = row.querySelector('td:nth-child(4)');
    const sourceDestCell = row.querySelector('td:nth-child(6)');

    if (actionCell) {
        actionCell.textContent = extractValue(data.action.action);
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
    const actionValue = extractValue(data.action.action);

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