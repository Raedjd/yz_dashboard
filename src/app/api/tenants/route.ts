import { NextRequest, NextResponse } from "next/server";
import * as service from "@/server/services/tenant.service";
import { requireAdmin, AuthError } from "@/server/config/auth";
import {ApiResponse} from "@/shared/types/shared";
import {ValidationErrorApi} from "@server/utils/validatorError";
import {validateTenantFilters} from "@server/validators/tenant.validator";

//===> /api/tenants?PageNumber=1&PageSize=20&SortBy=name&SortOrder=asc&Search=xxx
export async function GET(req: NextRequest) {
    try {
        await requireAdmin(req);

        const filters = validateTenantFilters(new URL(req.url).searchParams);
        const { items, totalCount } = await service.getTenants(filters);

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

//==> /api/tenants
export async function POST(req: NextRequest) {
    try {
        await requireAdmin(req);

        const body = await req.json();
        console.log("POST /tenants body:", body);

        const tenant = await service.createTenant(body);

        return NextResponse.json(tenant, { status: 201 });
    } catch (e: any) {
        if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}