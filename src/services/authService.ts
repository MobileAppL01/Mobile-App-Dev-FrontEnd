import axiosInstance from './axiosInstance';
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
        formData.append('file', {
            uri: file.uri,
            name: file.fileName || 'avatar.jpg',
            type: file.type || 'image/jpeg'
        } as any);

        // Fix: backend FileController is at /api/files, not /api/v1/files
        let baseURL = axiosInstance.defaults.baseURL || "";
        if (baseURL.endsWith("/v1")) {
            baseURL = baseURL.replace(/\/v1$/, "");
        }

        // We can't use axiosInstance directly because it forces baseURL
        // So we construct the full URL
        const fullUrl = `${baseURL}/files/upload/avatar`;

        // Get token manually if needed, or use axios with absolute URL (axios supports absolute URL overriding baseURL)
        // But axiosInstance has interceptors for Token.
        // Option 1: Use axiosInstance with FULL URL (it should override baseURL if url is absolute? No, it concatenates if not careful, but usually absolute URL overrides)
        // Let's try passing the full URL to axiosInstance.

        const response = await axiosInstance.post(fullUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
