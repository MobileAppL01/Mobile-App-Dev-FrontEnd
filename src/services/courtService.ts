import axiosInstance from './axiosInstance';

export interface CourtDTO {
    id: number;
    name: string;
}

export const courtService = {
    getCourtsByLocationId: async (locationId: number): Promise<CourtDTO[]> => {
        const response = await axiosInstance.get(`/court/${locationId}`);
        return response.data;
    }
};
