export function renderInitialHTML() {
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
          <div class="table-container" id="events-table-container">
            <table class="data-table" id="events-table">
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
      
       <!-- Log File Modal -->
      <div id="log-file-modal" class="modal">
        <div class="modal-content">
          <span class="close" data-modal="log-file-modal">&times;</span>
          <h2>Log File Details</h2>
          <div id="log-file-details"></div>
        </div>
      </div>
    </section>
  </div>
  `;
}