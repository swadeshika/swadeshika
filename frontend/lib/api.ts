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
        // If token expired, clear local storage so user can re-login
        if (data.message?.toLowerCase().includes('token') && (data.message?.toLowerCase().includes('expire') || response.status === 401)) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            // We use a small delay for reload to ensure current updates process
            setTimeout(() => {
                window.location.href = '/login';
            }, 100);
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
