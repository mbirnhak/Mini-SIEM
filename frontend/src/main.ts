import './style.css'
import { register, login } from './users.ts'

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

    console.log('Logging in:', { username, password })

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

    console.log('Registering user:', { name, username, email, password })
    register({ name, username, email, password })
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
// Function to display events in the table
function displayEvents(events) {
    if (!events || events.length === 0) {
        eventsTableBody.innerHTML = '<tr><td colspan="7">No events found</td></tr>'
        return
    }

    eventsTableBody.innerHTML = ''

    events.forEach(event => {
        const row = document.createElement('tr')

        // Format timestamp - convert from Unix timestamp to date
        const timestamp = event.timestamp ?
            new Date(event.timestamp * 1000).toLocaleString() : 'N/A'

        // Get the raw log line
        const rawLine = event.rawline?.rawline || 'No raw line'

        // Extract file ID
        const fileId = event.fileid?.id || 'N/A'

        // Alert ID if available
        const alertId = event.associatedalertid?.id || 'N/A'

        // Parse basic information from the raw line
        let action = 'Unknown'
        let source = 'N/A'
        let destination = 'N/A'
        let message = rawLine

        // Very basic parsing of common log formats
        if (rawLine.includes('blocked')) {
            action = 'Blocked'
        } else if (rawLine.includes('connection')) {
            action = 'Connection'
        } else if (rawLine.includes('login')) {
            action = 'Authentication'
        } else if (rawLine.includes('DNS')) {
            action = 'DNS'
        } else if (rawLine.includes('GET') || rawLine.includes('POST')) {
            action = 'HTTP Request'
        }

        // Extract source and destination if available
        const ipMatch = rawLine.match(/(\d+\.\d+\.\d+\.\d+)/g)
        if (ipMatch && ipMatch.length >= 1) {
            source = ipMatch[0]
            if (ipMatch.length >= 2) {
                destination = ipMatch[1]
            }
        }

        row.innerHTML = `
            <td>${event.id}</td>
            <td>${timestamp}</td>
            <td>File ${fileId}</td>
            <td>${action}</td>
            <td>${message}</td>
            <td>${source} → ${destination}</td>
            <td>${alertId !== 'N/A' ? `Alert ${alertId}` : 'No alert'}</td>
        `

        eventsTableBody.appendChild(row)
    })
}

// Add event listener for refresh button
refreshBtn?.addEventListener('click', fetchLatestEvents)

// Add event listener for limit select
limitSelect?.addEventListener('change', fetchLatestEvents)