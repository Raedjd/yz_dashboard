interface KeycloakTokenResponse {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
    refresh_expires_in?: number;
    token_type: string;
}

interface LoginDto {
    username: string;
    password: string;
}

const KEYCLOAK_REALM_URL = process.env.KEYCLOAK_REALM_URL as string;
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM as string;
const KEYCLOAK_AUDIENCE = process.env.KEYCLOAK_AUDIENCE as string;

export async function login(dto: LoginDto): Promise<KeycloakTokenResponse> {
    if (!KEYCLOAK_REALM_URL) {
        throw new Error("Please define KEYCLOAK_REALM_URL");
    }
    if (!KEYCLOAK_REALM) {
        throw new Error("Please define KEYCLOAK_REALM");
    }
    if (!KEYCLOAK_AUDIENCE) {
        throw new Error("Please define KEYCLOAK_AUDIENCE");
    }
    if (!dto.username || !dto.password) {
        throw new AuthServiceError("Missing username or password", 400);
    }

    const tokenUrl = `${KEYCLOAK_REALM_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;

    const body = new URLSearchParams();
    body.set("grant_type", "password");
    body.set("scope", "email openid roles");
    body.set("client_id", KEYCLOAK_AUDIENCE);
    body.set("username", dto.username);
    body.set("password", dto.password);

    const response = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
    });

    if (!response.ok) {
        if (response.status === 401 || response.status === 400) {
            throw new AuthServiceError("Invalid username or password", 401);
        }
        throw new AuthServiceError("Authentication service unavailable", 502);
    }

    return response.json();
}

export class AuthServiceError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}