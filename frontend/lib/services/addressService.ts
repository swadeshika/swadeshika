import { api } from '@/lib/api'

export interface Address {
    id: string
    name: string
    phone: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    postalCode: string
    country: string
    addressType: string
    isDefault: boolean
}

export const addressService = {
    getAddresses: async () => {
        const res = await api.get<Address[]>('/addresses')
        return res.data.data
    },

    createAddress: async (data: Omit<Address, 'id' | 'isDefault'> & { isDefault?: boolean }) => {
        const res = await api.post<Address>('/addresses', data)
        return res.data.data
    },

    updateAddress: async (id: string, data: Partial<Address>) => {
        const res = await api.put<Address>(`/addresses/${id}`, data)
        return res.data.data
    },

    deleteAddress: async (id: string) => {
        const res = await api.delete<any>(`/addresses/${id}`)
        return res.data
    }
}
