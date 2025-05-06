import { fetchApi, postApi, deleteApi } from './api';
import { Rawline } from '../types';

/**
 * Loads all rawlines and displays them in the rawlines tab
 */
export async function loadRawlines() {
    try {
        const response = await fetchApi('/events/rawlines');
        const rawlines = await response.json();
        const rawlinesTab = document.getElementById('tab-rawlines');

        if (!rawlinesTab) {
            console.error('Rawlines tab element not found');
            return;
        }

        // Create table structure first
        rawlinesTab.innerHTML = `
        <div class="table-container" id="rawlines-table-container">
          <table class="data-table" id="rawlines-table">
            <thead>
              <tr>
                <th>Rawline</th>
                <th>Source</th>
                <th>Destination</th>
                <th>Action</th>
                <th>Message</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="rawlines-body">
              <!-- Rawlines will be loaded here -->
            </tbody>
          </table>
        </div>
        `;

        const rawlinesTableBody = document.getElementById('rawlines-body');

        if (!rawlinesTableBody) {
            console.error('Rawlines table body element not found after creation');
            return;
        }

        // Process each rawline and add to table
        rawlines.forEach((rawline: Rawline) => {
            const row = document.createElement('tr');

            // Extract rawline details with fallbacks
            const rawlineText = shortenText(rawline.rawline || '', 50);
            const source = rawline.sourcedeviceid ? `Device ${rawline.sourcedeviceid.id}` : 'N/A';
            const sourcePort = rawline.sourceport ? `:${rawline.sourceport}` : '';
            const destination = rawline.destinationdeviceid ? `Device ${rawline.destinationdeviceid.id}` : 'N/A';
            const destPort = rawline.destinationport ? `:${rawline.destinationport}` : '';
            const action = rawline.action ? rawline.action.action : 'N/A';
            const message = shortenText(rawline.message || '', 50);

            row.innerHTML = `
  <td><a href="#" class="rawline-link" data-rawline="${encodeURIComponent(rawline.rawline)}">${rawlineText}</a></td>
  <td>${source}${sourcePort}</td>
  <td>${destination}${destPort}</td>
  <td>${action}</td>
  <td>${message}</td>
  <td>
    <button class="action-btn view-btn" data-rawline="${encodeURIComponent(rawline.rawline)}">View</button>
    <button class="action-btn delete-btn" data-rawline="${encodeURIComponent(rawline.rawline)}">Delete</button>
  </td>
`;

            rawlinesTableBody.appendChild(row);
        });

        // If no rawlines were found
        if (rawlines.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="6" class="empty-message">No rawlines found</td>';
            rawlinesTableBody.appendChild(emptyRow);
        }

        // Add event listeners for action buttons
        addRawlineActionListeners();

    } catch (error) {
        console.error('Error loading rawlines:', error);
        const rawlinesTab = document.getElementById('tab-rawlines');

        if (rawlinesTab) {
            rawlinesTab.innerHTML = '<div class="error">Failed to load rawlines</div>';
        }
    }
}

/**
 * Searches for rawlines based on a search term
 * @param searchTerm The search term to use
 */
export async function searchRawlines(searchTerm: string) {
    try {
        const encodedTerm = encodeURIComponent(searchTerm);
        const response = await fetchApi(`/events/rawlines/search?term=${encodedTerm}`);
        const rawlines = await response.json();
        displayFilteredRawlines(rawlines, `Search Results for: "${searchTerm}"`);
    } catch (error) {
        console.error('Error searching rawlines:', error);
        showRawlineLoadError(`Failed to search rawlines: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Performs a full-text search on rawlines
 * @param searchTerm The search term to use
 */
export async function fullTextSearchRawlines(searchTerm: string) {
    try {
        const encodedTerm = encodeURIComponent(searchTerm);
        const response = await fetchApi(`/events/rawlines/fulltext?term=${encodedTerm}`);
        const rawlines = await response.json();
        displayFilteredRawlines(rawlines, `Full-Text Search Results for: "${searchTerm}"`);
    } catch (error) {
        console.error('Error performing full-text search:', error);
        showRawlineLoadError(`Failed to perform full-text search: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Performs an advanced search for rawlines based on multiple criteria
 */
export async function advancedSearchRawlines(
    sourceDeviceId?: number,
    destDeviceId?: number,
    sourcePort?: number,
    destPort?: number,
    actionId?: string,
    messageText?: string
) {
    try {
        // Build query string with only the provided parameters
        const params = new URLSearchParams();
        if (sourceDeviceId) params.append('sourceDeviceId', sourceDeviceId.toString());
        if (destDeviceId) params.append('destDeviceId', destDeviceId.toString());
        if (sourcePort) params.append('sourcePort', sourcePort.toString());
        if (destPort) params.append('destPort', destPort.toString());
        if (actionId) params.append('actionId', actionId);
        if (messageText) params.append('messageText', messageText);

        const response = await fetchApi(`/events/rawlines/advanced-search?${params.toString()}`);
        const rawlines = await response.json();
        displayFilteredRawlines(rawlines, 'Advanced Search Results');
    } catch (error) {
        console.error('Error performing advanced search:', error);
        showRawlineLoadError(`Failed to perform advanced search: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Retrieves details for a specific rawline
 * @param rawline The rawline content to get details for
 */
export async function getRawlineDetails(rawline: string) {
    try {
        const response = await postApi(`/events/rawlines/details`,{
            rawline: rawline
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch rawline details: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error getting rawline details:', error);
        throw error;
    }
}

/**
 * Creates a new rawline
 * @param rawlineData The rawline data to create
 */
export async function createRawline(rawlineData: any) {
    try {
        const response = await postApi('/events/rawlines', rawlineData);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create rawline: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating rawline:', error);
        throw error;
    }
}

/**
 * Deletes a rawline
 * @param rawline The rawline content to delete
 */
export async function deleteRawline(rawline: string) {
    try {
        const response = await postApi(`/events/rawlines/delete`,{
            rawline: rawline
        });

        if (!response.ok) {
            throw new Error(`Failed to delete rawline: ${response.status} ${response.statusText}`);
        }

        return true;
    } catch (error) {
        console.error('Error deleting rawline:', error);
        throw error;
    }
}

/**
 * Displays filtered rawlines with a custom heading
 * @param rawlines The rawlines to display
 * @param heading The heading to show above the rawlines
 */
function displayFilteredRawlines(rawlines: Rawline[], heading: string) {
    const rawlinesTab = document.getElementById('tab-rawlines');

    if (!rawlinesTab) {
        console.error('Rawlines tab element not found');
        return;
    }

    // Create table structure with heading
    rawlinesTab.innerHTML = `
    <div class="filter-heading">${heading}</div>
    <div class="table-container" id="rawlines-table-container">
      <table class="data-table" id="rawlines-table">
        <thead>
          <tr>
            <th>Rawline</th>
            <th>Source</th>
            <th>Destination</th>
            <th>Action</th>
            <th>Message</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="rawlines-body">
          <!-- Filtered rawlines will be loaded here -->
        </tbody>
      </table>
    </div>
    `;

    const rawlinesTableBody = document.getElementById('rawlines-body');

    if (!rawlinesTableBody) {
        console.error('Rawlines table body element not found after creation');
        return;
    }

    // Process each rawline and add to table
    rawlines.forEach((rawline: Rawline) => {
        const row = document.createElement('tr');

        // Extract rawline details with fallbacks
        const rawlineText = shortenText(rawline.rawline || '', 50);
        const source = rawline.sourcedeviceid ? `Device ${rawline.sourcedeviceid.id}` : 'N/A';
        const sourcePort = rawline.sourceport ? `:${rawline.sourceport}` : '';
        const destination = rawline.destinationdeviceid ? `Device ${rawline.destinationdeviceid.id}` : 'N/A';
        const destPort = rawline.destinationport ? `:${rawline.destinationport}` : '';
        const action = rawline.action ? rawline.action.action : 'N/A';
        const message = shortenText(rawline.message || '', 50);

        row.innerHTML = `
<td><a href="#" class="rawline-link" data-rawline="${encodeURIComponent(rawline.rawline)}">${rawlineText}</a></td>
<td>${source}${sourcePort}</td>
<td>${destination}${destPort}</td>
<td>${action}</td>
<td>${message}</td>
<td>
  <button class="action-btn view-btn" data-rawline="${encodeURIComponent(rawline.rawline)}">View</button>
  <button class="action-btn delete-btn" data-rawline="${encodeURIComponent(rawline.rawline)}">Delete</button>
</td>
`;

        rawlinesTableBody.appendChild(row);
    });

    // If no rawlines were found
    if (rawlines.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="6" class="empty-message">No rawlines found</td>';
        rawlinesTableBody.appendChild(emptyRow);
    }

    // Add event listeners for action buttons
    addRawlineActionListeners();
}

/**
 * Helper function to add event listeners to rawline action buttons
 */
function addRawlineActionListeners() {
    // Rawline link click
    document.querySelectorAll('.rawline-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const rawline = decodeURIComponent((e.currentTarget as HTMLElement).getAttribute('data-rawline') || '');
            viewRawlineDetails(rawline);
        });
    });

    // View button
    document.querySelectorAll('.view-btn[data-rawline]').forEach(button => {
        button.addEventListener('click', (e) => {
            const rawline = decodeURIComponent((e.currentTarget as HTMLElement).getAttribute('data-rawline') || '');
            viewRawlineDetails(rawline);
        });
    });

    // Delete button
    document.querySelectorAll('.delete-btn[data-rawline]').forEach(button => {
        button.addEventListener('click', async (e) => {
            const rawline = decodeURIComponent((e.currentTarget as HTMLElement).getAttribute('data-rawline') || '');
            confirmDeleteRawline(rawline);
        });
    });
}

/**
 * Shows a confirmation dialog for deleting a rawline
 * @param rawline The rawline to delete
 */
function confirmDeleteRawline(rawline: string) {
    const confirmDelete = confirm('Are you sure you want to delete this rawline? This action cannot be undone.');

    if (confirmDelete) {
        deleteRawline(rawline)
            .then(() => {
                alert('Rawline deleted successfully');
                loadRawlines(); // Reload the rawlines table
            })
            .catch(error => {
                alert(`Error deleting rawline: ${error instanceof Error ? error.message : String(error)}`);
            });
    }
}

/**
 * Displays details of a specific rawline
 * @param rawline The rawline content to display
 */
async function viewRawlineDetails(rawline: string) {
    try {
        const rawlineData = await getRawlineDetails(rawline);

        // Create a modal to show the rawline details
        const rawlineModal = createRawlineModal();
        const detailsDiv = document.getElementById('rawline-details');

        if (!detailsDiv) return;

        // Extract rawline details with fallbacks
        const source = rawlineData.sourcedeviceid ? `Device ${extractValue(rawlineData.sourcedeviceid)}` : 'N/A';
        const sourcePort = rawlineData.sourceport ? `:${rawlineData.sourceport}` : '';
        const destination = rawlineData.destinationdeviceid ? `Device ${extractValue(rawlineData.destinationdeviceid)}` : 'N/A';
        const destPort = rawlineData.destinationport ? `:${rawlineData.destinationport}` : '';
        const action = rawlineData.action ? extractValue(rawlineData.action.action) : 'N/A';

        let parsedDataHtml = '<p>No parsed data available</p>';
        if (rawlineData.parseddata && Object.keys(rawlineData.parseddata).length > 0) {
            parsedDataHtml = `<pre>${JSON.stringify(rawlineData.parseddata, null, 2)}</pre>`;
        }

        detailsDiv.innerHTML = `
            <div class="rawline-original">
                <h3>Original Rawline</h3>
                <pre>${rawline}</pre>
            </div>
            <div class="rawline-parsed">
                <h3>Parsed Details</h3>
                <table>
                    <tr>
                        <th>Source</th>
                        <td>${source}${sourcePort}</td>
                    </tr>
                    <tr>
                        <th>Destination</th>
                        <td>${destination}${destPort}</td>
                    </tr>
                    <tr>
                        <th>Action</th>
                        <td>${action}</td>
                    </tr>
                    <tr>
                        <th>Message</th>
                        <td>${rawlineData.message || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>Parsed Data</th>
                        <td>${parsedDataHtml}</td>
                    </tr>
                </table>
            </div>
            <div class="rawline-actions">
                <button id="delete-rawline-btn" class="action-btn delete-btn">Delete Rawline</button>
            </div>
        `;

        // Add event listener to delete button
        const deleteBtn = document.getElementById('delete-rawline-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                rawlineModal.classList.remove('active');
                confirmDeleteRawline(rawline);
            });
        }

        // Show the modal
        rawlineModal.classList.add('active');

    } catch (error) {
        console.error('Error viewing rawline details:', error);

        // Enhanced error handling
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            // For long or complex rawlines, try an alternative approach
            alert("This rawline contains special characters that make it difficult to retrieve directly. " +
                "Consider using the rawlines tab search functionality instead.");
        } else {
            alert(`Error viewing rawline details: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}

/**
 * Helper function to show an error message
 * @param errorMessage The error message to display
 */
function showRawlineLoadError(errorMessage: string) {
    const rawlinesTab = document.getElementById('tab-rawlines');

    if (rawlinesTab) {
        rawlinesTab.innerHTML = `<div class="error">${errorMessage}</div>`;
    }
}

/**
 * Creates a modal for displaying rawline details
 */
function createRawlineModal() {
    let rawlineModal = document.getElementById('rawline-modal');

    if (!rawlineModal) {
        rawlineModal = document.createElement('div');
        rawlineModal.id = 'rawline-modal';
        rawlineModal.className = 'modal';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => {
            rawlineModal?.classList.remove('active');
        };

        const detailsDiv = document.createElement('div');
        detailsDiv.id = 'rawline-details';

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(detailsDiv);
        rawlineModal.appendChild(modalContent);

        document.body.appendChild(rawlineModal);

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === rawlineModal) {
                rawlineModal?.classList.remove('active');
            }
        });
    }

    return rawlineModal;
}

/**
 * Helper function to shorten text with ellipsis
 * @param text The text to shorten
 * @param maxLength The maximum length before shortening
 * @returns The shortened text
 */
function shortenText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

/**
 * Helper function to extract values from nested objects
 * @param obj The possibly nested object to extract a value from
 * @returns The extracted value
 */
function extractValue(obj: any): any {
    if (obj === null || obj === undefined) {
        return 'N/A';
    }

    if (typeof obj === 'object') {
        // If it's an object with an 'id' property, return that
        if (obj.id !== undefined) {
            return obj.id;
        }

        // If it's an object with a 'value' property, return that
        if (obj.value !== undefined) {
            return obj.value;
        }

        // Return the first property value we find
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                return obj[key];
            }
        }
    }

    // Just return the value itself
    return obj;
}