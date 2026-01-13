import axiosInstance, { BASE_URL } from './axiosInstance';
import { Platform } from 'react-native';
import { LocationDTO } from '../types/location';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

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
        // --- COMPRESSION LOGIC ---
        let uploadUri = file.uri;
        try {
            const fileInfo = await FileSystem.getInfoAsync(file.uri);
            if (fileInfo.exists && fileInfo.size > 1 * 1024 * 1024) { // > 1MB
                // console.log(`[Location] File size ${fileInfo.size} > 1MB, compressing...`);
                const manipResult = await manipulateAsync(
                    file.uri,
                    [{ resize: { width: 1200 } }], // Reasonable size for location images
                    { compress: 0.8, format: SaveFormat.JPEG }
                );
                uploadUri = manipResult.uri;
                // console.log(`[Location] Compressed URI: ${uploadUri}`);
            }
        } catch (compError) {
            console.warn("[Location] Compression check failed:", compError);
        }
        // --- END COMPRESSION ---

        const formData = new FormData();
        // Fix for Android URI
        let uri = uploadUri;
        if (Platform.OS === 'android' && !uri.startsWith('file://')) {
            uri = `file://${uri}`;
        }

        formData.append('file', {
            uri: uri,
            name: file.fileName || 'location.jpg',
            type: file.type || 'image/jpeg'
        } as any);
        formData.append('setPrimary', String(setPrimary));

        try {
            const response = await axiosInstance.post(`${LOCATIONS_API}/${locationId}/images`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error: any) {
            console.error("Upload location image error:", error);
            const msg = error.response?.data?.message || error.message;
            if (msg && msg.includes("Maximum upload size exceeded")) {
                throw new Error("Ảnh quá lớn, vui lòng chọn ảnh có dung lượng nhỏ hơn.");
            }
            throw new Error(msg || "Lỗi tải ảnh lên server");
        }
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
