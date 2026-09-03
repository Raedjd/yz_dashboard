import { NextRequest, NextResponse } from "next/server";
import * as service from "@/server/services/connection.service";
import { requireAdmin, AuthError } from "@/server/config/auth";
import {validateConnectionFilters} from "@server/validators/connection.validator";
import {ApiResponse} from "@/shared/types/shared";
import {ValidationErrorApi} from "@server/utils/validatorError";



export async function GET(req: NextRequest) {
    try {
        await requireAdmin(req);
        const filters = validateConnectionFilters(new URL(req.url).searchParams);
        const { items, totalCount } = await service.getConnections(filters);

        return NextResponse.json({
            Items: items,
            TotalCount: totalCount,
            PageNumber: filters.PageNumber,
            PageSize: filters.PageSize,
        } satisfies ApiResponse<any>);
    } catch (e: any) {
        if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
        if (e instanceof ValidationErrorApi) return NextResponse.json({ error: e.message }, { status: 422 });
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await requireAdmin(req);
        const body = await req.json();
        const connection = await service.createConnection(body);
        return NextResponse.json(connection, { status: 201 });
    } catch (e: any) {
        if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}