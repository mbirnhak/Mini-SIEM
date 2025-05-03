import { postApi, deleteApi } from './api';

// Global variable to store logged in user ID
let loggedInUserId: string | null = null;

export function getLoggedInUserId(): string | null {
    return loggedInUserId;
}

export function setLoggedInUserId(id: string | null) {
    loggedInUserId = id;
}

export async function login(credentials: { username: string, password: string }): Promise<string | null> {
    try {
        // Make the API call
        const response = await postApi('/users/login', credentials);

        // Check for non-200 status
        if (!response.ok) {
            // Get error message from response if possible
            try {
                const errorData = await response.json();
                console.error('Login error:', errorData);
                if (errorData.message && errorData.message.includes("Inaccurate Credential")) {
                    return null; // Invalid credentials
                }
            } catch (parseError) {
                // If we can't parse JSON, just use status text
                console.error('Login error:', response.statusText);
            }
            return null;
        }

        // Parse success response
        const user = await response.json();
        console.log('Server response:', user);

        if (user && user.id) {
            const userId = user.id;
            setLoggedInUserId(userId);
            return userId;
        }

        return null;
    } catch (error) {
        console.error('Login error:', error);
        return null;
    }
}

export async function register(userData: {
    name: string,
    username: string,
    email: string,
    password: string
    role: string
}): Promise<boolean> {
    try {
        const response = await postApi('/users', userData);
        console.log("Registration response: ", response);
        return true;
    } catch (error) {
        console.error('Registration error:', error);
        return false;
    }
}

export async function deleteAccount(userId: string): Promise<boolean> {
    try {
        await deleteApi(`/users/${userId}`);
        setLoggedInUserId(null);
        return true;
    } catch (error) {
        console.error('Error deleting account:', error);
        return false;
    }
}