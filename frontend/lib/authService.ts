import { api } from './api';

/**
 * Auth Response Interface
 */
export interface AuthResponse {
    user: {
        id: string;
        email: string;
        name: string;
        role: 'customer' | 'admin';
        phone?: string;
    };
    accessToken: string;
}

/**
 * Login/Register Request
 */
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

/**
 * Authentication Service
 * Handles all auth-related API calls
 */
export const authService = {
    /**
     * Login user
     */
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', credentials);

        // Store token in localStorage
        if (response.data.data.accessToken) {
            localStorage.setItem('accessToken', response.data.data.accessToken);
        }

        return response.data.data;
    },

    /**
     * Register new user
     */
    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/register', data);

        // Store token in localStorage
        if (response.data.data.accessToken) {
            localStorage.setItem('accessToken', response.data.data.accessToken);
        }

        return response.data.data;
    },

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        try {
            await api.post('/auth/logout', {});
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Always clear token
            localStorage.removeItem('accessToken');
        }
    },

    /**
     * Get current user
     */
    async getCurrentUser() {
        const response = await api.get<AuthResponse['user']>('/auth/me');
        return response.data.data;
    },

    /**
     * Change password
     */
    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        await api.post('/auth/change-password', {
            currentPassword,
            newPassword
        });
    },

    /**
     * Forgot password
     */
    async forgotPassword(email: string): Promise<void> {
        await api.post('/auth/forgot-password', { email });
    },

    /**
     * Reset password
     */
    async resetPassword(token: string, newPassword: string): Promise<void> {
        await api.post(`/auth/reset-password/${token}`, { newPassword });
    },

    /**
     * Get access token from storage
     */
    getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('accessToken');
        }
        return null;
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.getToken();
    }
};
