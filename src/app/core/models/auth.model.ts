export interface LoginRequest {
    email?: string;
    password?: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

export interface RegisterClientRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    profileImageUrl?: string;
    address?: string;
    phone?: string;
    companyName?: string;
}

export interface RegisterClientResponse {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    active: boolean;
    clientId: string;
    address: string;
    companyName: string;
    phone: string;
}
