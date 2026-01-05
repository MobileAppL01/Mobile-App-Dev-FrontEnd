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
    username: string;
    email: string;
    roles: string[];
    fullName?: string;
    phone?: string;
}

export interface UserData {
    id: string;
    name: string;
    fullName?: string; // Add this
    email: string;
    role: string;
    avatar?: string;
    phone: string;
    gender?: string;
    dob?: string;
}
