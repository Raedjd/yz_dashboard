import { NextRequest, NextResponse } from "next/server";
import * as service from "@/server/services/user.service";

function getTenantId(req: NextRequest): string {
    const tenantId = req.headers.get("x-company-db");
    if (!tenantId) {
        throw new Error("Missing X-Company-Db header");
    }
    return tenantId;
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const tenantId = getTenantId(req);
        const { id } = await params;

        const user = await service.getUser(tenantId, id);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const tenantId = getTenantId(req);
        const { id } = await params;
        const body = await req.json();

        const user = await service.updateUser(tenantId, id, body);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const tenantId = getTenantId(req);
        const { id } = await params;

        await service.deleteUser(tenantId, id);

        return NextResponse.json({
            success: true,
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}