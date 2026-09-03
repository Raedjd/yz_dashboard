import { NextRequest, NextResponse } from "next/server";
import * as service from "@/server/services/objectConfig.service";
import { requireAdmin, AuthError } from "@/server/config/auth";
import { ValidationErrorApi } from "@server/utils/validatorError";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await requireAdmin(req);
        const config = await service.getObjectConfig(params.id);
        return NextResponse.json(config);
    } catch (e: any) {
        if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await requireAdmin(req);
        const body = await req.json();
        const config = await service.updateObjectConfig(params.id, body);
        return NextResponse.json(config);
    } catch (e: any) {
        if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
        if (e instanceof ValidationErrorApi) return NextResponse.json({ error: e.message }, { status: 422 });
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await requireAdmin(req);
        await service.deleteObjectConfig(params.id);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
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

        const config = await service.setObjectConfigArchiveStatus(params.id, IsDeleted);
        return NextResponse.json(config);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}