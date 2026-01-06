import axiosInstance from './axiosInstance';

export interface CourtDTO {
    id: number;
    name: string;
}

export interface CourtSearchDTO {
    id: number;
    name: string;
    address: string;
    description: string;
    image: string;
    rating: number;
    pricePerHour: number;
    openTime: string; // LocalTime string e.g., "08:00:00"
    closeTime: string;
    status: string;
    locationId: number;
    province: string;
    district: string;
}

export const courtService = {
    getCourtsByLocationId: async (locationId: number): Promise<CourtDTO[]> => {
        const response = await axiosInstance.get(`/court/${locationId}`);
        return response.data;
    },

    searchCourts: async (params: {
        keyword?: string;
        province?: string;
        district?: string;
        minPrice?: number;
        maxPrice?: number;
        page?: number;
        size?: number;
    }): Promise<CourtSearchDTO[]> => {
        const response = await axiosInstance.get('/courts/search', { params });
        return response.data;
    },

    getProvinces: async (): Promise<string[]> => {
        const response = await axiosInstance.get('/courts/provinces');
        return response.data;
    },

    getDistrictsByProvince: async (province: string): Promise<string[]> => {
        const response = await axiosInstance.get('/courts/districts', {
            params: { province }
        });
        return response.data;
    },

    getAllDistricts: async (): Promise<string[]> => {
        const response = await axiosInstance.get('/courts/districts/all');
        return response.data;
    }
};
