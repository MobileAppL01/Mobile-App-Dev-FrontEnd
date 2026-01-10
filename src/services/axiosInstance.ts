import axios from 'axios';
import { Alert } from 'react-native';

let accessToken: string | null = null;
let onLogout: (() => void) | null = null;

export const setAccessToken = (token: string | null) => {
    accessToken = token;
};

export const getAccessToken = () => accessToken;

export const setupAxios = (logoutFn: () => void) => {
    onLogout = logoutFn;
};

export const BASE_URL = 'https://bookington-app.mangobush-e7ff5393.canadacentral.azurecontainerapps.io/api/v1';

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

// Interceptor xử lý response lỗi
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            const status = error.response.status;
            console.error('API Error Status:', status);

            // Xử lý lỗi 401 (Unauthorized) hoặc 403 (Forbidden)
            if (status === 401 || status === 403) {
                if (onLogout) {
                    Alert.alert(
                        "Phiên đăng nhập hết hạn",
                        "Vui lòng đăng nhập lại để tiếp tục.",
                        [
                            {
                                text: "OK",
                                onPress: () => {
                                    if (onLogout) onLogout();
                                }
                            }
                        ]
                    );
                }
            } else {
                console.error('API Error Data:', JSON.stringify(error.response.data, null, 2));
            }
        } else if (error.request) {
            console.error('API Error (No Response):', error.message);
        } else {
            console.error('API Setup Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
