import { login, register, deleteAccount, getLoggedInUserId, setLoggedInUserId } from '../services/auth-service';
import { showDashboard } from './dashboard.ts';

export function setupAuth() {
    // Setup login form submission
    setupLoginForm();

    // Setup register form submission
    setupRegisterForm();

    // Setup logout functionality
    setupLogout();

    // Setup account deletion
    setupAccountDeletion();
}

function setupLoginForm() {
    const submitLoginBtn = document.getElementById('submit-login');
    submitLoginBtn?.addEventListener('click', async () => {
        const usernameInput = document.getElementById('login-username') as HTMLInputElement;
        const passwordInput = document.getElementById('login-password') as HTMLInputElement;

        const username = usernameInput?.value || '';
        const password = passwordInput?.value || '';

        console.log('Logging in:', { username, password });

        try {
            const loggedInUserId = await login({ username, password });
            console.log('Logged in user ID:', loggedInUserId);

            if (loggedInUserId) {
                const loginModal = document.getElementById('login-modal') as HTMLElement;
                loginModal.style.display = 'none';
                showDashboard();
            } else {
                alert('Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login.');
        }
    });
}

function setupRegisterForm() {
    const submitRegisterBtn = document.getElementById('submit-register');
    submitRegisterBtn?.addEventListener('click', async () => {
        const nameInput = document.getElementById('name') as HTMLInputElement;
        const usernameInput = document.getElementById('username') as HTMLInputElement;
        const emailInput = document.getElementById('email') as HTMLInputElement;
        const passwordInput = document.getElementById('password') as HTMLInputElement;

        const name = nameInput?.value || '';
        const username = usernameInput?.value || '';
        const email = emailInput?.value || '';
        const password = passwordInput?.value || '';

        console.log('Registering user:', { name, username, email, password });
        const success = await register({ name, username, email, password, role: 'Analyst' });

        if (success) {
            const registerModal = document.getElementById('register-modal') as HTMLElement;
            registerModal.style.display = 'none';

            // Show dashboard after successful registration
            showDashboard();
        } else {
            alert('Registration failed. Please try again.');
        }
    });
}

function setupLogout() {
    const logoutButton = document.getElementById('logout-button') as HTMLButtonElement;
    logoutButton?.addEventListener('click', () => {
        setLoggedInUserId(null);

        const dashboard = document.getElementById('dashboard') as HTMLElement;
        const authSection = document.getElementById('auth-section') as HTMLElement;
        const eventsTableBody = document.getElementById('events-body') as HTMLElement;

        dashboard.style.display = 'none';
        authSection.style.display = 'block';
        eventsTableBody.innerHTML = ''; // Clear events when logged out

        alert('Logged out successfully.');
    });
}

function setupAccountDeletion() {
    const deleteAccountButton = document.getElementById('delete-account-button') as HTMLButtonElement;
    deleteAccountButton?.addEventListener('click', async () => {
        const loggedInUserId = getLoggedInUserId();

        if (!loggedInUserId) {
            alert('No user logged in.');
            return;
        }

        const confirmDelete = confirm('Are you sure you want to delete your account? This action cannot be undone.');
        if (!confirmDelete) return;

        try {
            const success = await deleteAccount(loggedInUserId);

            if (success) {
                alert('Account deleted successfully.');

                const dashboard = document.getElementById('dashboard') as HTMLElement;
                const authSection = document.getElementById('auth-section') as HTMLElement;
                const eventsTableBody = document.getElementById('events-body') as HTMLElement;

                dashboard.style.display = 'none';
                authSection.style.display = 'block';
                eventsTableBody.innerHTML = '';
            } else {
                throw new Error('Failed to delete account');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('Failed to delete account.');
        }
    });
}