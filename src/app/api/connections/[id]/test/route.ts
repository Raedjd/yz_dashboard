import { NextRequest, NextResponse } from "next/server";
import * as service from "@server/services/connection.service";
import {AuthError, requireAdmin} from "@server/config/auth";


export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await requireAdmin(req);
        const result = await service.testConnectionById(params.id);
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
    } catch (e: any) {
        if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}