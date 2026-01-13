import axiosInstance, { getAccessToken } from './axiosInstance';
import { Platform } from 'react-native';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export const authService = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await axiosInstance.post('/auth', data);
        return response.data;
    },

    registerPlayer: async (data: RegisterRequest) => {
        const response = await axiosInstance.post('/register/players', data);
        return response.data;
    },

    registerOwner: async (data: RegisterRequest) => {
        const response = await axiosInstance.post('/register/owners', data);
        return response.data;
    },

    forgotPassword: async (email: string) => {
        const response = await axiosInstance.post('/auth/forgot-password/send-otp', { email });
        return response.data;
    },

    verifyOtp: async (email: string, otp: string) => {
        const response = await axiosInstance.post('/auth/forgot-password/verify-otp', { email, otp });
        return response.data;
    },

    resetPassword: async (data: any) => {
        // data should be { email, otp, newPassword }
        const response = await axiosInstance.post('/auth/reset-password-otp', data);
        return response.data;
    },

    changePassword: async (data: any) => {
        // data should be { oldPassword, newPassword }
        const response = await axiosInstance.post('/change-password', data);
        return response.data;
    },

    updateProfile: async (data: any) => {
        const response = await axiosInstance.put('/users/me', data);
        return response.data;
    },

    getMyProfile: async () => {
        const response = await axiosInstance.get('/users/me');
        return response.data;
    },

    getProfile: async (userId: number) => {
        const response = await axiosInstance.get(`/users/${userId}`);
        return response.data;
    },

    updatePushToken: async (pushToken: string) => {
        const response = await axiosInstance.post('/users/push-token', { pushToken });
        return response.data;
    },

    uploadAvatar: async (file: any) => {
        // --- COMPRESSION LOGIC ---
        let uploadUri = file.uri;
        try {
            const fileInfo = await FileSystem.getInfoAsync(file.uri);
            if (fileInfo.exists && fileInfo.size > 1 * 1024 * 1024) { // > 1MB
                console.log(`[Avatar] File size ${fileInfo.size} > 1MB, compressing...`);
                const manipResult = await manipulateAsync(
                    file.uri,
                    [{ resize: { width: 800 } }], // Avatar can be smaller (800px)
                    { compress: 0.8, format: SaveFormat.JPEG }
                );
                uploadUri = manipResult.uri;
                console.log(`[Avatar] Compressed URI: ${uploadUri}`);
            }
        } catch (compError) {
            console.warn("[Avatar] Compression check failed:", compError);
        }
        // --- END COMPRESSION ---

        const formData = new FormData();

        // Fix for Android
        let uri = uploadUri;
        if (Platform.OS === 'android' && !uri.startsWith('file://')) {
            uri = `file://${uri}`;
        }

        // Fix for MimeType: Android sometimes returns null
        let type = file.mimeType || file.type;
        if (!type || type === 'image') {
            const ext = uri.split('.').pop()?.toLowerCase();
            type = ext === 'png' ? 'image/png' : 'image/jpeg';
        }

        formData.append('file', {
            uri: uri,
            name: file.fileName || `avatar_${Date.now()}.jpg`,
            type: type
        } as any);

        // Logic to construct the full URL
        let baseURL = axiosInstance.defaults.baseURL || "";
        // Strip trailing slash if present
        if (baseURL.endsWith('/')) {
            baseURL = baseURL.slice(0, -1);
        }
        // Strip /v1 if present to target /api/files... not /api/v1/files...
        if (baseURL.endsWith("/v1")) {
            baseURL = baseURL.replace(/\/v1$/, "");
        }

        const fullUrl = `${baseURL}/files/upload/avatar`;

        const token = getAccessToken();

        try {
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("Upload response parsing failed:", text);
                throw new Error("Upload failed: Invalid server response");
            }

            if (!response.ok) {
                if ((data.message && data.message.includes("Maximum upload size exceeded")) || text.includes("Maximum upload size exceeded")) {
                    throw new Error("Ảnh quá lớn, vui lòng chọn ảnh có dung lượng nhỏ hơn.");
                }
                // Propagate exact error
                throw new Error(data.message || `Lỗi tải ảnh: ${response.status}`);
            }
            return data;
        } catch (error) {
            console.error("Upload avatar error:", error);
            throw error;
        }
    }
};
