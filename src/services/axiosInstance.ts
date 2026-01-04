import axios from 'axios';

// Biến cục bộ để lưu token, tránh import Store gây vòng lặp
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
    accessToken = token;
};

const BASE_URL = 'https://bookington-app.mangobush-e7ff5393.canadacentral.azurecontainerapps.io/api/v1';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Tự động thêm token vào header mỗi lần gọi API
axiosInstance.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
