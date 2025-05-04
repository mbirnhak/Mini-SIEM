export function renderInitialHTML() {
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="landing-container">
    <!-- Modern Landing Page -->
    <section id="auth-section" class="landing-page">
      <!-- Hero Section -->
      <header class="hero">
        <div class="hero-content">
          <div class="logo-section">
            <div class="logo-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <h1>SecureOps</h1>
          </div>
          <p class="tagline">Advanced Security Information and Event Management</p>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0V14.76a4.5 4.5 0 1 0 5 0z"/>
                </svg>
              </div>
              <h3>Real-time Monitoring</h3>
              <p>Monitor your systems 24/7 with advanced threat detection</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3>Automated Reporting</h3>
              <p>Generate comprehensive security reports automatically</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="14 2 18 6 7 17 3 17 3 13 14 2"/>
                  <line x1="3" y1="22" x2="21" y2="22"/>
                </svg>
              </div>
              <h3>Custom Alerts</h3>
              <p>Set up personalized alerts for critical events</p>
            </div>
          </div>
          <div class="cta-section">
            <button id="register-button" class="cta-primary">Get Started</button>
            <button id="login-button" class="cta-secondary">Login</button>
          </div>
        </div>
      </header>

      <!-- Security Stats -->
      <section class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <h2>1M+</h2>
            <p>Events Processed Daily</p>
          </div>
          <div class="stat-card">
            <h2>99.9%</h2>
            <p>Threat Detection Rate</p>
          </div>
          <div class="stat-card">
            <h2>24/7</h2>
            <p>Continuous Monitoring</p>
          </div>
          <div class="stat-card">
            <h2>< 1s</h2>
            <p>Response Time</p>
          </div>
        </div>
      </section>
    </section>

    <!-- Dashboard Section (Hidden by default) -->
    <section id="dashboard" style="display: none;">
      <h3>View Suspicious Activity Here</h3>
      <nav id="top-nav" class="top-nav">
        <button class="nav-tab" data-tab="home">Home</button>
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
        <div class="tab-panel" id="tab-home">
            <!-- Charts and statistics will be dynamically inserted here -->
        </div>
        <div class="tab-panel" id="tab-devices" style="display: none;">Loading Devices...</div>
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
        <!-- Dashboard Controls Section -->
        <div class="dashboard-controls">
          <button id="refresh-events">Refresh Events</button>
          <select id="limit-select">
            <option value="10">10 events</option>
            <option value="25">25 events</option>
            <option value="50">50 events</option>
          </select>
        </div>
        
        <!-- User Controls Section -->
        <div id="user-controls">
          <button id="logout-button">Logout</button>
          <button id="delete-account-button">Delete Account</button>
        </div>
    </section>

    <!-- Modals Section -->
    <section id="modals">
      <!-- Login Modal -->
      <div id="login-modal" class="modal">
        <div class="modal-content">
          <span class="close" data-modal="login-modal">&times;</span>
          <h2>Welcome Back</h2>
          <p class="modal-subtitle">Login to your secure dashboard</p>
          <div class="form-group">
            <label for="login-username">Username</label>
            <input type="text" id="login-username" placeholder="Enter your username" />
          </div>
          <div class="form-group">
            <label for="login-password">Password</label>
            <input type="password" id="login-password" placeholder="Enter your password" />
          </div>
          <button id="submit-login" class="submit-btn">Login</button>
        </div>
      </div>

      <!-- Register Modal -->
      <div id="register-modal" class="modal">
        <div class="modal-content">
          <span class="close" data-modal="register-modal">&times;</span>
          <h2>Create Account</h2>
          <p class="modal-subtitle">Join our secure platform</p>
          <div class="form-group">
            <label for="name">Full Name</label>
            <input type="text" id="name" placeholder="Enter your full name" />
          </div>
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" placeholder="Choose a username" />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" placeholder="Enter your email" />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" placeholder="Create a strong password" />
          </div>
          <button id="submit-register" class="submit-btn">Register</button>
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