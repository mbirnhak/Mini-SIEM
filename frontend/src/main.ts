import './style.css';
import {renderInitialHTML} from './components/layout';
import {setupAuth} from './components/auth';
import {setupDashboard} from './components/dashboard';
import {setupModals} from './components/modal';
import {setupTabs} from './components/tabs';
import { setupHomeDashboard } from './services/home-service.ts'

// Initialize the application
function initApp() {
    // Render initial HTML
    renderInitialHTML();

    // Setup components
    setupModals();
    setupAuth();
    setupTabs();
    setupDashboard();
    setupHomeDashboard();
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);