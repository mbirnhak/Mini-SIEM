import './style.css'
import {register, login} from './users.ts'

const BASE_URL = 'http://localhost:8080/api'
let loggedInUserId: string | null = null;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="container">
  <h1>Security Information and Event Management</h1>

  <!-- Authentication Section -->
  <section id="auth-section">
    <div class="auth-buttons">
      <button id="login-button">Login</button>
      <button id="register-button">Register</button>
    </div>
  </section>

  <!-- Dashboard Section -->
<section id="dashboard" style="display: none;">
  <h2>Latest Events Dashboard</h2>
<nav id="top-nav" class="top-nav">
  <button class="nav-tab" data-tab="devices">Devices</button>
  <button class="nav-tab" data-tab="log-files">Log Files</button>
  <button class="nav-tab" data-tab="log-events">Log Events</button>
  <button class="nav-tab" data-tab="alerts">Alerts</button>
  <button class="nav-tab" data-tab="alert-rules">Alert Rules</button>
  <button class="nav-tab" data-tab="incident-reports">Incident Reports</button>
  <button class="nav-tab" data-tab="threat-intel">Threat Intelligence</button>
  <button class="nav-tab" data-tab="actions">Actions</button>
  <button class="nav-tab" data-tab="event-categories">Event Categories</button>
</nav>
<div id="tab-content">
  <div class="tab-panel" id="tab-devices">Loading Devices...</div>
  <div class="tab-panel" id="tab-log-files" style="display: none;">Loading Log Files...</div>
  <div class="tab-panel" id="tab-log-events" style="display: none;">
  <div id="events-table-container">
    <table id="events-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Timestamp</th>
          <th>File ID</th>
          <th>Action</th>
          <th>Raw Log</th>
          <th>Source → Destination</th>
          <th>Alert ID</th>
        </tr>
      </thead>
      <tbody id="events-body">
        <!-- Events will be loaded here -->
      </tbody>
    </table>
  </div>
  </div>
  <div class="tab-panel" id="tab-alerts" style="display: none;">Loading Alerts...</div>
  <div class="tab-panel" id="tab-alert-rules" style="display: none;">Loading Alert Rules...</div>
  <div class="tab-panel" id="tab-incident-reports" style="display: none;">Loading Incidents...</div>
  <div class="tab-panel" id="tab-threat-intel" style="display: none;">Loading Threat Intelligence...</div>
  <div class="tab-panel" id="tab-actions" style="display: none;">Loading Actions...</div>
  <div class="tab-panel" id="tab-event-categories" style="display: none;">Loading Event Categories...</div>
</div>
  <div class="dashboard-controls">
    <button id="refresh-events">Refresh</button>
    <select id="limit-select">
      <option value="10">10 events</option>
      <option value="25">25 events</option>
      <option value="50">50 events</option>
    </select>
  </div>

  <div id="user-controls">
    <button id="logout-button" style="background-color: #f39c12;">Logout</button>
    <button id="delete-account-button" style="background-color: #e74c3c;">Delete Account</button>
  </div>
</section>

<!-- Modals Section -->
<section id="modals">
  <!-- Login Modal -->
  <div id="login-modal" class="modal">
    <div class="modal-content">
      <span class="close" data-modal="login-modal">&times;</span>
      <h2>Login</h2>
      <input type="text" id="login-username" placeholder="Username" />
      <input type="password" id="login-password" placeholder="Password" />
      <button id="submit-login">Login</button>
    </div>
  </div>

  <!-- Register Modal -->
  <div id="register-modal" class="modal">
    <div class="modal-content">
      <span class="close" data-modal="register-modal">&times;</span>
      <h2>Register</h2>
      <input type="text" id="name" placeholder="Name" />
      <input type="text" id="username" placeholder="Username" />
      <input type="email" id="email" placeholder="Email" />
      <input type="password" id="password" placeholder="Password" />
      <button id="submit-register">Register</button>
    </div>
  </div>
</section>
`

// Modal functionality
const loginModal = document.getElementById('login-modal') as HTMLElement
const registerModal = document.getElementById('register-modal') as HTMLElement
const loginBtn = document.getElementById('login-button')
const registerBtn = document.getElementById('register-button')
const closeBtns = document.querySelectorAll('.close')

// Dashboard elements
const authSection = document.getElementById('auth-section') as HTMLElement
const dashboard = document.getElementById('dashboard') as HTMLElement
const refreshBtn = document.getElementById('refresh-events')
const limitSelect = document.getElementById('limit-select') as HTMLSelectElement
const eventsTableBody = document.getElementById('events-body') as HTMLElement

// Navigation bar
const navTabs = document.querySelectorAll('.nav-tab');
const tabPanels = document.querySelectorAll('.tab-panel');

navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const selectedTab = tab.getAttribute('data-tab');
        tabPanels.forEach(panel => {
            panel.style.display = 'none';
        });
        document.getElementById(`tab-${selectedTab}`)!.style.display = 'block';
    });
});


// Open login modal
loginBtn?.addEventListener('click', () => {
    registerModal.style.display = 'none'; // Make sure register modal is closed
    loginModal.style.display = 'block';
})

// Open register modal
registerBtn?.addEventListener('click', () => {
    loginModal.style.display = 'none'; // Make sure login modal is closed
    registerModal.style.display = 'block';
})


// Close modals when clicking on X
closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        closeModals();
    })
})

// Close modals when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === loginModal || event.target === registerModal) {
        closeModals();
    }
})

function closeModals() {
    loginModal.style.display = 'none';
    registerModal.style.display = 'none';
}

// Login form submission
const submitLoginBtn = document.getElementById('submit-login')
submitLoginBtn?.addEventListener('click', async () => {
    const usernameInput = document.getElementById('login-username') as HTMLInputElement
    const passwordInput = document.getElementById('login-password') as HTMLInputElement

    const username = usernameInput?.value || ''
    const password = passwordInput?.value || ''

    console.log('Logging in:', {username, password})

    try {
        loggedInUserId = await login({username, password}) // <-- assume login returns user ID or null
        console.log('Logged in user ID:', loggedInUserId)

        if (loggedInUserId) {
            loginModal.style.display = 'none'
            showDashboard()
        } else {
            alert('Login failed. Please check your credentials.')
        }
    } catch (error) {
        console.error('Login error:', error)
        alert('An error occurred during login.')
    }
})

// Register form submission
const submitRegisterBtn = document.getElementById('submit-register')
submitRegisterBtn?.addEventListener('click', () => {
    const nameInput = document.getElementById('name') as HTMLInputElement
    const usernameInput = document.getElementById('username') as HTMLInputElement
    const emailInput = document.getElementById('email') as HTMLInputElement
    const passwordInput = document.getElementById('password') as HTMLInputElement

    const name = nameInput?.value || ''
    const username = usernameInput?.value || ''
    const email = emailInput?.value || ''
    const password = passwordInput?.value || ''

    console.log('Registering user:', {name, username, email, password})
    register({name, username, email, password})
    registerModal.style.display = 'none'

    // Show dashboard after successful registration
    showDashboard()
})

// Logout functionality
const logoutButton = document.getElementById('logout-button') as HTMLButtonElement
logoutButton?.addEventListener('click', () => {
    loggedInUserId = null;
    dashboard.style.display = 'none';
    authSection.style.display = 'block';
    eventsTableBody.innerHTML = ''; // Clear events when logged out
    alert('Logged out successfully.');
})

// Delete account functionality
const deleteAccountButton = document.getElementById('delete-account-button') as HTMLButtonElement
deleteAccountButton?.addEventListener('click', async () => {
    if (!loggedInUserId) {
        alert('No user logged in.');
        return;
    }

    const confirmDelete = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${BASE_URL}/users/${loggedInUserId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Failed to delete account: ${response.status} ${response.statusText}`);
        }

        alert('Account deleted successfully.');
        loggedInUserId = null;
        dashboard.style.display = 'none';
        authSection.style.display = 'block';
        eventsTableBody.innerHTML = '';
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('Failed to delete account.');
    }
})

// Function to show dashboard and hide auth section
function showDashboard() {
    authSection.style.display = 'none'
    dashboard.style.display = 'block'
    fetchLatestEvents()
}

// Function to fetch latest events from the API
async function fetchLatestEvents() {
    try {
        const limit = limitSelect.value
        console.log("LIMIT", limit)
        // Use the full URL as shown in your working curl command
        const response = await fetch(`${BASE_URL}/events/logevents/latest?limit=${limit}`)

        if (!response.ok) {
            throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`)
        }

        const events = await response.json()
        displayEvents(events)
    } catch (error) {
        console.error('Error fetching events:', error)
        eventsTableBody.innerHTML = `<tr><td colspan="5">Error loading events: ${error.message}</td></tr>`
    }
}

// Function to display events in the table
function displayEvents(events) {
    if (!events || events.length === 0) {
        eventsTableBody.innerHTML = '<tr><td colspan="7">No events found</td></tr>';
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

// Add click event listeners to rawline links
function addRawlineLinkListeners() {
    const rawlineLinks = document.querySelectorAll('.rawline-link');

    rawlineLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const rawline = decodeURIComponent(link.getAttribute('data-rawline'));
            showRawlineDetails(rawline, link);
        });
    });
}

// Function to fetch and show rawline details
async function showRawlineDetails(rawline, linkElement) {
    try {
        // Encode the rawline to make it URL-safe
        const encodedRawline = encodeURIComponent(rawline);
        const response = await fetch(`${BASE_URL}/events/rawlines/${encodedRawline}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch rawline details: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Create or show modal with the parsed data
        showRawlineModal(data, rawline);

        // Update the placeholders in the same row as the clicked link
        updateRowWithParsedData(linkElement, data);

    } catch (error) {
        console.error('Error fetching rawline details:', error);
        alert(`Error fetching details: ${error.message}`);
    }
}

// Function to update the row with parsed data
function updateRowWithParsedData(linkElement, data) {
    const row = linkElement.closest('tr');
    if (!row) return;

    // Find the action and source/destination cells in this row
    const actionCell = row.querySelector('td:nth-child(4)');
    const sourceDestCell = row.querySelector('td:nth-child(6)');

    if (actionCell) {
        actionCell.textContent = data.action || 'Unknown';
        actionCell.classList.remove('placeholder-data');
    }

    if (sourceDestCell) {
        const source = data.sourcedeviceid ? `Device ${data.sourcedeviceid}` : 'N/A';
        const sourcePort = data.sourceport ? `:${data.sourceport}` : '';
        const destination = data.destinationdeviceid ? `Device ${data.destinationdeviceid}` : 'N/A';
        const destPort = data.destinationport ? `:${data.destinationport}` : '';

        sourceDestCell.textContent = `${source}${sourcePort} → ${destination}${destPort}`;
        sourceDestCell.classList.remove('placeholder-data');
    }
}

// Function to show a modal with rawline details
function showRawlineModal(data, rawline) {
    // Check if the modal already exists, if not create it
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
            rawlineModal.style.display = 'none';
        };

        const title = document.createElement('h2');
        title.textContent = 'Raw Line Details';

        const detailsDiv = document.createElement('div');
        detailsDiv.id = 'rawline-details';

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(detailsDiv);
        rawlineModal.appendChild(modalContent);

        document.body.appendChild(rawlineModal);

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === rawlineModal) {
                rawlineModal.style.display = 'none';
            }
        });
    }

    // Helper function to extract values from possibly nested objects
    function extractValue(obj, propertyName) {
        if (!obj) return 'N/A';

        // If the property is an object with an 'id' or 'name' field, use that
        if (typeof obj === 'object') {
            if (obj.id) return obj.id;
            if (obj.name) return obj.name;
            // Try stringifying but limit it to avoid overwhelming the UI
            try {
                const str = JSON.stringify(obj);
                if (str.length < 50) return str;
                return `[Complex Object]`;
            } catch (e) {
                return `[Object]`;
            }
        }

        return obj;
    }

    // Update modal content with the parsed data
    const detailsDiv = document.getElementById('rawline-details');

    // Extract action value
    const actionValue = data.action ? extractValue(data.action) : 'N/A';

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

// Add this function to fetch devices from your backend and update the DOM
async function loadDevices() {
    try {
        const response = await fetch(`${BASE_URL}/devices`);
        if (!response.ok) {
            throw new Error('Failed to fetch devices');
        }
        const devices = await response.json();

        const devicesTable = document.getElementById('tab-devices');
        devicesTable.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Hostname</th>
            <th>IP Address</th>
            <th>Operating System</th>
            <th>Location</th>
            <th>Device Type</th>
          </tr>
        </thead>
        <tbody>
          ${devices.map((device: any) => `
            <tr>
              <td>${device.id}</td>
              <td>${device.hostname}</td>
              <td>${device.ipaddress}</td>
              <td>${device.operatingsystem}</td>
              <td>${device.location}</td>
              <td>${device.devicetype}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    } catch (error) {
        console.error(error);
    }
}

// When the "Devices" tab is clicked, load the devices
document.querySelector<HTMLButtonElement>('[data-tab="devices"]')?.addEventListener('click', () => {
    const devicesTab = document.getElementById('tab-devices')!;
    devicesTab.style.display = 'block';
    loadDevices();  // Fetch and display devices
});

// Add event listener for refresh button
refreshBtn?.addEventListener('click', fetchLatestEvents)

// Add event listener for limit select
limitSelect?.addEventListener('change', fetchLatestEvents)