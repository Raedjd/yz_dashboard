import { NextRequest, NextResponse } from "next/server";
import * as service from "@/server/services/user.service";

function getTenantId(req: NextRequest): string {
    const tenantId = req.headers.get("x-company-db");
    if (!tenantId) {
        throw new Error("Missing X-Company-Db header");
    }
    return tenantId;
}

export async function GET(req: NextRequest) {
    try {
        const tenantId = getTenantId(req);
        const users = await service.getUsers(tenantId);
        return NextResponse.json(users);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const tenantId = getTenantId(req);
        const body = await req.json();
        const user = await service.createUser(tenantId, body);
        return NextResponse.json(user, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}