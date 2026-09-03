export interface LoginCredentials {
    username: string;
    password: string;
}

export interface LoginResponseModel {
    access_token: string;
    expires_in: number;  // En secondes depuis Keycloak
    refresh_token?: string;
    token_type?: string;
}

export interface LoginResult {
    success: boolean;
    token?: string;
    error?: number;
}

export interface DecodedToken {
    tenant_id?: string | number;
    tenant?: string | number;
    "X-Company-Db"?: string; // Tenant depuis le header custom
    user_id?: string | number;
    email?: string;
    preferred_username?: string;
    Roles?: string[];
}

export interface ForgetPasswordRequest {
    email: string;
}

export interface ForgetPasswordResponse {
    message: string;
}

export interface ResetPasswordRequest {
    email: string;
    newpassword: string;
}

export interface ResetPasswordResponse {
    message: string;
}

export interface UpdateAvatarRequest {
    formData: FormData;
}

export interface UpdateAvatarResponse {
    message: string;
}
