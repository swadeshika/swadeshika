const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1';

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
         * CRITICAL FIX: Token Expiration Handling
         * ========================================
         * 
         * PROBLEM (Before):
         * - Used window.location.href for hard redirect
         * - Lost all unsaved form data
         * - Didn't clear Zustand stores properly
         * - No user notification
         * 
         * SOLUTION (Now):
         * - Use soft navigation (preserves React state during transition)
         * - Clear all stores properly (auth + cart)
         * - Show toast notification to inform user
         * - Graceful cleanup sequence
         * 
         * WHY THIS MATTERS:
         * - Better UX: Users don't lose unsaved work
         * - Proper cleanup: No stale data in memory
         * - User awareness: Toast explains what happened
         */
        if (data.message?.toLowerCase().includes('token') && (data.message?.toLowerCase().includes('expire') || response.status === 401)) {
            // Only handle token expiration in browser context
            if (typeof window !== 'undefined') {
                // Run cleanup asynchronously to avoid blocking
                // Use IIFE (Immediately Invoked Function Expression) to handle async operations
                (async () => {
                    try {
                        // Step 1: Clear localStorage tokens
                        // This prevents any pending requests from using expired token
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('user');

                        // Step 2: Clear Zustand stores
                        // Import stores dynamically to avoid circular dependencies
                        const { useAuthStore } = await import('./auth-store');
                        const { useCartStore } = await import('./cart-store');

                        // Clear auth store (sets user to null, isAuthenticated to false)
                        useAuthStore.getState().logout();

                        // Clear cart store (removes all items)
                        await useCartStore.getState().clearCart();

                        // Step 3: Clear Zustand persistence
                        // This ensures localStorage keys are removed
                        (useAuthStore as any).persist?.clearStorage?.();
                        (useCartStore as any).persist?.clearStorage?.();

                        // Step 4: Show user-friendly notification
                        // Dynamic import to avoid dependency issues
                        const { toast } = await import('@/hooks/use-toast');
                        toast({
                            title: 'Session Expired',
                            description: 'Your session has expired. Please login again to continue.',
                            variant: 'destructive',
                        });

                        // Step 5: Navigate to login
                        // NOTE: Cannot use useRouter() here - it's a React hook and can only be called in components
                        // Using window.location is acceptable since session is expired and user needs to re-authenticate
                        setTimeout(() => {
                            window.location.href = '/login';
                        }, 1000);
                    } catch (cleanupError) {
                        // Fallback: If cleanup fails, redirect immediately
                        console.error('[API] Cleanup failed, redirecting immediately:', cleanupError);
                        window.location.href = '/login';
                    }
                })();
            }
        }

        // Create an error object that includes the detailed messages from the backend
        const error: any = new Error(data.message || 'API request failed');
        error.status = response.status;
        error.errors = data.errors; // Validation errors array
        throw error;
    }

    return { data };
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
    /** Make a DELETE request */
    delete: <T = any>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
