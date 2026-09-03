import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";

const KEYCLOAK_REALM_URL = process.env.KEYCLOAK_REALM_URL as string;
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM as string;


if (!KEYCLOAK_REALM_URL) {
    throw new Error("Missing KEYCLOAK_REALM_URL");
}
if (!KEYCLOAK_REALM) {
    throw new Error("Missing KEYCLOAK_REALM");
}


const KEYCLOAK_ISSUER = `${KEYCLOAK_REALM_URL}/realms/${KEYCLOAK_REALM}`;
const KEYCLOAK_JWKS_URL = `${KEYCLOAK_ISSUER}/protocol/openid-connect/certs`;

const JWKS = createRemoteJWKSet(new URL(KEYCLOAK_JWKS_URL));

export interface KeycloakPayload extends JWTPayload {
    preferred_username?: string;
    email?: string;
    realm_access?: { roles: string[] };
    resource_access?: Record<string, { roles: string[] }>;
    tenant_id?: string;
}

export async function verifyKeycloakToken(token: string): Promise<KeycloakPayload> {
    const { payload } = await jwtVerify(token, JWKS, {
        issuer: KEYCLOAK_ISSUER,
    });

    return payload as KeycloakPayload;
}