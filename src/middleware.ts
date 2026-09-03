import { NextRequest, NextResponse } from "next/server";
import { verifyKeycloakToken } from "@/server/config/keycloak";

const PUBLIC_API_ROUTES = ["/api/login", "/api/tenants","/api/connections","/api/objects-config"];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // ─────────────────────────────────────────────
    // 1. Routes API
    // ─────────────────────────────────────────────
    if (pathname.startsWith("/api")) {
        if (PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))) {
            return NextResponse.next();
        }

        const tenantId = req.headers.get("x-company-db");
        const authHeader = req.headers.get("authorization");

        if (!tenantId) {
            return NextResponse.json(
                { error: "Missing X-Company-Db header" },
                { status: 400 }
            );
        }

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: "Missing or invalid Authorization header" },
                { status: 401 }
            );
        }

        const token = authHeader.slice(7);

        try {
            const payload = await verifyKeycloakToken(token);

            const requestHeaders = new Headers(req.headers);
            requestHeaders.set("x-user-id", payload.sub ?? "");
            requestHeaders.set("x-user-email", payload.email ?? "");

            return NextResponse.next({
                request: { headers: requestHeaders },
            });
        } catch (err: any) {
            return NextResponse.json(
                { error: "Invalid or expired token", detail: err.message },
                { status: 401 }
            );
        }
    }

    // ─────────────────────────────────────────────
    // 2. Pages (navigation front)
    // ─────────────────────────────────────────────
    const token = req.cookies.get("auth_token")?.value;
    const tokenExpiry = req.cookies.get("token_expiry")?.value;
    const isLoginPage = pathname === "/login";

    if (token && tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
        const response = NextResponse.redirect(new URL("/login", req.url));
        ["auth_token", "token_expiry", "tenant_id"].forEach((key) => {
            response.cookies.delete(key);
        });
        return response;
    }

    if (!token && !isLoginPage) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    if (token && isLoginPage) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};