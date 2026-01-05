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
        const response = await axiosInstance.post('/auth/forgot-password', { email });
        return response.data;
    },

    verifyOtp: async (email: string, otp: string) => {
        const response = await axiosInstance.post('/auth/verify-otp', { email, otp });
        return response.data;
    },

    resetPassword: async (data: any) => {
        const response = await axiosInstance.post('/auth/reset-password', data);
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
    }
};
