export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1';

/**
 * Standard API Response structure
 */
interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
}

/**
 * Generic API request handler
 * 
 * @param endpoint - The API endpoint (relative to BASE_URL)
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns Promise resolving to the response data
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: ApiResponse<T> }> {
    const url = `${BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    // Add auth token if available
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    console.log(`[API] Fetching: ${url}`, options);
    let response;
    try {
        response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include', // ✅ CRITICAL: Send cookies (refresh token) with every request
        });
    } catch (fetchError: any) {
        console.error(`[API] Network Error for ${url}:`, fetchError);
        throw fetchError; // Re-throw to be caught by the component
    }

    let data;
    try {
        data = await response.json();
    } catch (error) {
        console.error('[API] Failed to parse JSON response:', error);
        throw new Error(`API Request Failed: ${response.status} ${response.statusText}`);
    }

    if (!response.ok) {
        /**
         * CRITICAL FIX: Automatic Token Refresh
         * ======================================
         * 
         * PROBLEM (Before):
         * - User logged out immediately when access token expired (15 min)
         * - Lost all unsaved work
         * - Poor user experience
         * 
         * SOLUTION (Now):
         * - Detect 401 error (token expired)
         * - Automatically call refresh endpoint
         * - Get new access token using refresh token
         * - Retry original request with new token
         * - Only logout if refresh token also expired (30 days)
         * 
         * WHY THIS MATTERS:
         * - User stays logged in for 30 days (as long as they're active)
         * - No interruption every 15 minutes
         * - Seamless experience
         * - Refresh token rotates on each use (security)
         */
        if (response.status === 401 && typeof window !== 'undefined') {
            // Check if this is a token expiration (not login failure)
            // Check if this is a token expiration OR missing token (which should trigger refresh via cookie)
            const errorMsg = data.message?.toLowerCase() || '';
            const isTokenExpired =
                (errorMsg.includes('token') && errorMsg.includes('expire')) ||
                errorMsg.includes('token is required') ||
                errorMsg.includes('invalid token');

            // Don't try to refresh on login/register endpoints
            const isAuthEndpoint = endpoint.includes('/auth/login') ||
                endpoint.includes('/auth/register') ||
                endpoint.includes('/auth/refresh-token') ||
                endpoint.includes('/auth/logout');

            if (isTokenExpired && !isAuthEndpoint) {
                console.log('[API] Access token expired, attempting refresh...');

                try {
                    // Call refresh token endpoint
                    const refreshResponse = await fetch(`${BASE_URL}/auth/refresh-token`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include', // Important: sends cookies (refresh token)
                    });

                    if (refreshResponse.ok) {
                        const refreshData = await refreshResponse.json();
                        const newAccessToken = refreshData.data.accessToken;

                        // Save new access token
                        localStorage.setItem('accessToken', newAccessToken);
                        console.log('[API] Token refreshed successfully, retrying request...');

                        // Retry original request with new token
                        headers['Authorization'] = `Bearer ${newAccessToken}`;
                        const retryResponse = await fetch(url, {
                            ...options,
                            headers,
                        });

                        const retryData = await retryResponse.json();

                        if (retryResponse.ok) {
                            return { data: retryData };
                        } else {
                            // Retry failed, throw error
                            const error: any = new Error(retryData.message || 'API request failed');
                            error.status = retryResponse.status;
                            error.errors = retryData.errors;
                            throw error;
                        }
                    } else {
                        // Refresh token also expired or invalid
                        console.log('[API] Refresh token expired, logging out...');
                        await handleLogout();
                    }
                } catch (refreshError) {
                    console.error('[API] Token refresh failed:', refreshError);
                    await handleLogout();
                }
            } else if (!isAuthEndpoint) {
                // 401 but not token expiration (e.g., wrong credentials)
                const error: any = new Error(data.message || 'Unauthorized');
                error.status = response.status;
                error.errors = data.errors;
                throw error;
            }
        }

        // Create an error object that includes the detailed messages from the backend
        const error: any = new Error(data.message || 'API request failed');
        error.status = response.status;
        error.errors = data.errors; // Validation errors array
        if (data.errors) {
            console.error('❌ [API] Validation Failed:', JSON.stringify(data.errors, null, 2));
        }
        throw error;
    }

    console.log(`[API] Response received for ${url}:`, {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
    });
    console.log(`[API] Response data:`, data);

    return { data };
}

/**
 * Handle user logout when refresh token expires
 */
async function handleLogout() {
    if (typeof window === 'undefined') return;

    // CRITICAL: Clear state IMMEDIATELY to prevent infinite loops
    // Don't wait for API responses that might fail with 401

    // Clear localStorage tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    // Clear Zustand stores
    try {
        const { useAuthStore } = await import('./auth-store');
        const { useCartStore } = await import('./cart-store');
        const { useWishlistStore } = await import('./wishlist-store');

        useAuthStore.getState().logout();
        useCartStore.getState().clearCart();
        useWishlistStore.getState().clearWishlist();
    } catch (error) {
        console.error('Error clearing stores:', error);
    }

    // Try to call logout endpoint (best effort, don't wait for response)
    // This clears the refresh token cookie on backend
    fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    }).catch(() => {
        // Silently fail - we've already cleared local state
    });

    // Redirect immediately
    window.location.href = '/login';
}

/**
 * API Utility object for making HTTP requests.
 * Automatically handles base URL and common headers.
 */
export const api = {
    /** Make a GET request */
    get: <T = any>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
    /** Make a POST request */
    post: <T = any>(endpoint: string, body: any) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    /** Make a PUT request */
    put: <T = any>(endpoint: string, body: any) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    /** Make a PATCH request */
    patch: <T = any>(endpoint: string, body: any) => request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
    /** Make a DELETE request */
    delete: <T = any>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
