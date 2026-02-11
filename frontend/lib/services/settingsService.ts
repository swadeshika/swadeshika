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
    enabledGateways?: {
        razorpay: boolean
        cod: boolean
    }
}

export const settingsService = {
    getSettings: async () => {
        const res = await api.get('/settings')
        const data = res.data.data
        return {
            ...data,
            enabledGateways: data.enabled_gateways || { razorpay: false, cod: false }
        } as AppSettings
    }
}
