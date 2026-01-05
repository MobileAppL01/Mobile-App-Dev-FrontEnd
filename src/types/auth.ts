export interface LoginRequest {
    username: string; // This is actually the email
    password: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    role?: 'PLAYER' | 'OWNER';
}

export interface AuthResponse {
    token: string;
    type: string;
    id: number;
    username: string; // This is email in response too usually
    email: string;
    roles: string[];
}

export interface UserData {
    id: string; // keeping as string for frontend consistency, need to map from number
    name: string;
    email: string;
    role: string;
    avatar?: string;
    phone: string;
    gender?: string; // Backend might not return this immediately in login response?
    dob?: string;
}
