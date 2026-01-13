import axiosInstance from './axiosInstance';

export interface RevenueStatistics {
    totalRevenue: number;
    totalBookings: number;
    canceledBookings: number;
    completedBookings: number;
    pendingBookings: number;
}

export const adminService = {
    getAllOwners: async () => {
        const response = await axiosInstance.get('/admin/owners');
        return response.data;
    },

    getAllUsers: async () => {
        const response = await axiosInstance.get('');
        return response.data;
    },

    getOwnerRevenue: async (ownerId: number, month: number, year: number) => {
        const response = await axiosInstance.get(`/admin/owners/${ownerId}/revenue`, {
            params: { month, year }
        });
        return response.data;
    },

    getOwnerCourtRevenue: async (ownerId: number, month: number, year: number) => {
        const response = await axiosInstance.get(`/admin/owners/${ownerId}/revenue/courts`, {
            params: { month, year }
        });
        return response.data;
    },

    getOwnerLocationRevenue: async (ownerId: number, month: number, year: number) => {
        const response = await axiosInstance.get(`/admin/owners/${ownerId}/revenue/locations`, {
            params: { month, year }
        });
        return response.data;
    },

    getOwnerBookings: async (ownerId: number, month: number, year: number) => {
        const response = await axiosInstance.get(`/admin/owners/${ownerId}/bookings/history`, {
            params: { month, year } // Assuming backend supports this
        });
        return response.data;
    },

    deleteUser: async (userId: number) => {
        const response = await axiosInstance.delete(`/${userId}`);
        return response.data;
    }
};

export interface LocationRevenue {
    locationId: number;
    locationName: string;
    locationAddress: string;
    totalRevenue: number;
}
