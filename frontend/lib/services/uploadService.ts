/**
 * Upload Service
 * Handles file uploads to backend
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1';

// Derive backend origin (e.g., http://localhost:5001) from BASE_URL
let BACKEND_ORIGIN: string;
try {
    BACKEND_ORIGIN = new URL(BASE_URL).origin;
} catch (e) {
    BACKEND_ORIGIN = BASE_URL.replace(/\/api\/v1\/?$/, '');
}

export { BACKEND_ORIGIN };

export const uploadService = {
    /**
     * Upload single image
     * @param file - File object to upload
     * @returns Promise<string> - Full URL of uploaded image
     */
    async uploadImage(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('image', file);

        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${BASE_URL}/upload/image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        console.log('[UploadService] Upload response:', data);

        if (!data.success) {
            throw new Error(data.message || 'Upload failed');
        }

        // Return full URL based on configured backend origin
        const fullUrl = `${BACKEND_ORIGIN}${data.data.url}`;
        console.log('[UploadService] Generated URL:', fullUrl);
        return fullUrl;
    },

    /**
     * Upload multiple images
     * @param files - Array of File objects to upload
     * @returns Promise<string[]> - Array of full URLs of uploaded images
     */
    async uploadImages(files: File[]): Promise<string[]> {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('images', file);
        });

        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${BASE_URL}/upload/images`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        console.log('[UploadService] Multiple upload response:', data);

        if (!data.success) {
            throw new Error(data.message || 'Upload failed');
        }

        // Return full URLs based on configured backend origin
        const fullUrls = data.data.map((item: any) => `${BACKEND_ORIGIN}${item.url}`);
        console.log('[UploadService] Generated URLs:', fullUrls);
        return fullUrls;
    },

    /**
     * Delete image from server
     * @param url - Full URL of the image to delete
     */
    async deleteImage(url: string): Promise<void> {
        // Extract filename from URL
        const filename = url.split('/').pop();
        if (!filename) {
            throw new Error('Invalid image URL');
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${BASE_URL}/upload/image`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filename })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Delete failed');
        }
    }
};
