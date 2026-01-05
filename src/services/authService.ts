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
    }
};
