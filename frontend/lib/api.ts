const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

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

    console.log(`[API] Fetching: ${url}`); // Debug log

    const response = await fetch(url, {
        ...options,
        headers,
    });

    let data;
    try {
        data = await response.json();
    } catch (error) {
        console.error('[API] Failed to parse JSON response:', error);
        throw new Error(`API Request Failed: ${response.status} ${response.statusText}`);
    }

    if (!response.ok) {
        console.error(`[API] Error ${response.status}:`, data);
        if (response.status === 401 && typeof window !== 'undefined') {
            // Token expired or invalid
            localStorage.removeItem('accessToken');
            localStorage.removeItem('auth-storage');
            window.location.href = '/login';
        }
        throw new Error(data.message || 'API request failed');
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
