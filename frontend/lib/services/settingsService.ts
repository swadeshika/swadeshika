import { api } from '@/lib/api'

export interface AppSettings {
    id: number
    site_name: string
    support_email: string
    support_phone: string
    currency: 'inr' | 'usd'
    gst_percent: number
    flat_rate: number
    free_shipping_threshold: number
    default_order_status: string
    timezone: string
}

export const settingsService = {
    getSettings: async () => {
        // The controller says: /api/v1/settings
        const res = await api.get<AppSettings>('/settings')
        return res.data.data
    }
}
