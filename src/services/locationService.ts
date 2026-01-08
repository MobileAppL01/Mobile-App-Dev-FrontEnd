import axiosInstance, { BASE_URL } from './axiosInstance';
import { LocationDTO } from '../types/location';

const LOCATIONS_API = BASE_URL.replace('/v1', '/locations');

export interface LocationImage {
    id: number;
    locationId: number;
    publicId: string;
    secureUrl: string;
    isPrimary: boolean;
    createdAt: string;
}

export const locationService = {
    getAllLocations: async (): Promise<LocationDTO[]> => {
        const response = await axiosInstance.get('/location');
        return response.data;
    },

    getLocationsByAddress: async (address: string): Promise<LocationDTO[]> => {
        const response = await axiosInstance.get('/location', { params: { address } });
        return response.data;
    },

    uploadImage: async (locationId: number, file: any, setPrimary: boolean = false) => {
        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            name: file.fileName || 'location.jpg',
            type: file.type || 'image/jpeg'
        } as any);
        formData.append('setPrimary', String(setPrimary));

        const response = await axiosInstance.post(`${LOCATIONS_API}/${locationId}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getImages: async (locationId: number) => {
        const response = await axiosInstance.get(`${LOCATIONS_API}/${locationId}/images`);
        return response.data;
    },

    setPrimaryImage: async (imageId: number) => {
        const response = await axiosInstance.put(`${LOCATIONS_API}/images/${imageId}/primary`);
        return response.data;
    },

    deleteImage: async (imageId: number) => {
        const response = await axiosInstance.delete(`${LOCATIONS_API}/images/${imageId}`);
        return response.data;
    }
};
