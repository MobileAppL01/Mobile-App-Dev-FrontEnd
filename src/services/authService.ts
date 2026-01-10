import axiosInstance, { getAccessToken } from './axiosInstance';
import { Platform } from 'react-native';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';

export const authService = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await axiosInstance.post('/auth', data);
        console.log("response data at authservice", response.data);
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
        const formData = new FormData();

        // Fix for Android: Remove 'file://' prefix if present to normalize, then add it back correctly if needed
        // Actually, for FormData on Android, it OFTEN needs 'file://'.
        // Expo Image Picker usually returns 'file:///...' on Android, but let's be safe.
        let uri = file.uri;
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
        // Note: Check if backend really follows this convention. 
        // Based on previous comments, backend FileController is at /api/files (or /files relative to root context)
        // If baseURL is .../api/v1, we want .../api
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
                    // Do NOT set Content-Type for FormData; fetch sets it with boundary
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
                // 'text' already contains the response body, 'data' contains parsed JSON if successful
                try {
                    // Check if 'data' (parsed JSON) contains the message
                    if (data.message && data.message.includes("Maximum upload size exceeded")) {
                        throw new Error("Dung lượng ảnh quá lớn (Tối đa 5MB).");
                    }
                    throw new Error(data.message || 'Upload failed');
                } catch (e: any) {
                    // If parsing 'data' failed or 'data.message' wasn't the issue, check raw 'text'
                    if (text.includes("Maximum upload size exceeded")) {
                        throw new Error("Dung lượng ảnh quá lớn (Tối đa 5MB).");
                    }
                    // If specific custom error was thrown inside try, rethrow it
                    if (e.message && e.message.includes("Dung lượng")) throw e;

                    throw new Error('Upload failed');
                }
            }
            return data; // Return the already parsed 'data' if response was OK
        } catch (error) {
            console.error("Upload avatar error:", error);
            throw error;
        }
    }
};

