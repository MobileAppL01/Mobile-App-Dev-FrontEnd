export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    role?: string;
}

export interface AuthResponse {
    token: string;
    type: string;
    id: number;
    username: string;
    email: string;
    roles: string[];
    fullName?: string;
    phone?: string;
}

export interface UserData {
    id: string;
    fullName: string;
    email: string;
    role: string;
    avatar?: string;
    phone: string;
    gender?: string;
    dob?: string;
}
