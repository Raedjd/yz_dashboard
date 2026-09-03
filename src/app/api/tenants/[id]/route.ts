import { NextRequest, NextResponse } from "next/server";
import * as service from "@/server/services/tenant.service";
import { requireAdmin, AuthError } from "@/server/config/auth";

//==> /api/tenants/id
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireAdmin(req);
        const tenant = await service.getTenant(params.id);
        return NextResponse.json(tenant);
    } catch (e: any) {
        if (e instanceof AuthError) {
            return NextResponse.json({ error: e.message }, { status: e.status });
        }
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}

//==> /api/tenants/id
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireAdmin(req);
        const body = await req.json();
        const tenant = await service.updateTenant(params.id, body);
        return NextResponse.json(tenant);
    } catch (e: any) {
        if (e instanceof AuthError) {
            return NextResponse.json({ error: e.message }, { status: e.status });
        }
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}

//==> /api/tenants/id
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireAdmin(req);
        await service.deleteTenant(params.id);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        if (e instanceof AuthError) {
            return NextResponse.json({ error: e.message }, { status: e.status });
        }
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await requireAdmin(req);
        const { IsDeleted } = await req.json();

        if (typeof IsDeleted !== 'boolean') {
            return NextResponse.json({ error: "IsDeleted must be a boolean" }, { status: 422 });
        }

        const tenant = await service.setTenantArchiveStatus(params.id, IsDeleted);
        return NextResponse.json(tenant);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}