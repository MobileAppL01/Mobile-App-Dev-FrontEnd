import axiosInstance, { getAccessToken } from './axiosInstance';
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

        // Use file.mimeType if available (Expo 15+), fallback to 'image/jpeg'
        const type = file.mimeType || file.type || 'image/jpeg';
        // Ensure type handles just "image" which some backends reject
        const finalType = type === 'image' ? 'image/jpeg' : type;

        formData.append('file', {
            uri: file.uri,
            name: file.fileName || `avatar_${Date.now()}.jpg`,
            type: finalType
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
                throw new Error(data.message || "Upload failed");
            }

            return data;
        } catch (error) {
            console.error("Upload avatar error:", error);
            throw error;
        }
    }
};
