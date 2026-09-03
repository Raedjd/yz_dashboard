import { NextRequest, NextResponse } from "next/server";
import * as service from "@/server/services/connection.service";
import { requireAdmin, AuthError } from "@/server/config/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await requireAdmin(req);
        const connection = await service.getConnection(params.id);
        return NextResponse.json(connection);
    } catch (e: any) {
        if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await requireAdmin(req);
        const body = await req.json();
        const connection = await service.updateConnection(params.id, body);
        return NextResponse.json(connection);
    } catch (e: any) {
        if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await requireAdmin(req);
        await service.deleteConnection(params.id);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}