import axiosInstance from './axiosInstance';
import { LocationDTO } from '../types/location';

export const locationService = {
    getAllLocations: async (): Promise<LocationDTO[]> => {
        const response = await axiosInstance.get('/location');
        return response.data;
    },

    getLocationsByAddress: async (address: string): Promise<LocationDTO[]> => {
        const response = await axiosInstance.get('/location', { params: { address } });
        return response.data;
    }
};
