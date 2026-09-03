import { NextRequest, NextResponse } from "next/server";
import { login, AuthServiceError } from "@/server/services/auth.service";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { username, password } = body;

        const tokenData = await login({ username, password });

        return NextResponse.json({
            access_token: tokenData.access_token,
            expires_in: tokenData.expires_in,
            refresh_token: tokenData.refresh_token,
        });
    } catch (e: any) {
        if (e instanceof AuthServiceError) {
            return NextResponse.json({ error: e.status }, { status: e.status });
        }
        console.error("Login error:", e.message);
        return NextResponse.json({ error: 500 }, { status: 500 });
    }
}