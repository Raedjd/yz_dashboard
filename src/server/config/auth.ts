import { NextRequest } from "next/server";
import { verifyKeycloakToken, KeycloakPayload } from "@/server/config/keycloak";

export async function requireAuth(req: NextRequest): Promise<KeycloakPayload> {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AuthError("Missing or invalid Authorization header", 401);
    }

    const token = authHeader.slice(7);

    try {
        const payload = await verifyKeycloakToken(token);
        return payload;
    } catch (err: any) {
        throw new AuthError("Invalid or expired token", 401);
    }
}

export async function requireAdmin(req: NextRequest): Promise<KeycloakPayload> {
    const payload = await requireAuth(req);
    return payload;
}

export class AuthError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}