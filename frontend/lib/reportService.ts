import { api } from './api';

export interface Report {
    id: number;
    report_type: 'sales' | 'inventory' | 'customers' | 'financial' | 'custom';
    name: string;
    parameters: any;
    file_url?: string;
    format: 'json' | 'pdf' | 'csv' | 'excel';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    generated_by_name?: string;
    created_at: string;
}

export interface ReportResponse {
    reports: Report[];
    pagination: {
        page: number;
        total: number;
        pages: number;
    };
}

export const ReportService = {
    // Get report stats with range (for AdminReports page)
    getStats: async (range: string = '30') => {
        return api.get(`/admin/dashboard/reports?range=${range}`);
    },

    // Get live dashboard overview (for AdminDashboard page)
    getOverview: async () => {
        return api.get('/admin/dashboard/overview');
    },

    // Generate a new report
    generate: async (data: { reportType: string; name: string; format?: string; parameters?: any }) => {
        return api.post('/admin/reports', data);
    },

    // Get list of generated reports
    getAll: async (params?: { page?: number; limit?: number; type?: string; status?: string }) => {
        const query = new URLSearchParams(params as any).toString();
        return api.get<ReportResponse>(`/admin/reports?${query}`);
    },

    // Delete a report
    delete: async (id: number) => {
        return api.delete(`/admin/reports/${id}`);
    },

    // Get Analytics Data (Charts - optional, if needed later)
    getAnalytics: async (params?: { startDate?: string; endDate?: string; metric?: string; interval?: string }) => {
        const query = new URLSearchParams(params as any).toString();
        return api.get(`/admin/analytics?${query}`);
    }
};
