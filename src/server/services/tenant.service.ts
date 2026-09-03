import * as repository from "@/server/repositories/tenant.repository";
import { validateCreateTenant , validateUpdateTenant } from "@/server/validators/tenant.validator";
import { generateUniqueSlug } from "@/server/utils/slug";
import { openTenantConnectionByDbName } from "@/server/config/tenantDb";
import { initTenantDatabase } from "@/server/config/tenantInit";
import { TenantFilters } from "@/server/dto/tenant-filters.dto";
import {Tenant} from "@server/types/tenant.type";


export async function createTenant(dto: Tenant) {
    validateCreateTenant(dto);
    let TenantId = generateUniqueSlug(dto.TenantName);
    let attempts = 0;

    while ((await repository.findByTenant(TenantId)) && attempts < 5) {
        TenantId = generateUniqueSlug(dto.TenantName);
        attempts++;
    }

    if (await repository.findByTenant(TenantId)) {
        throw new Error("Failed to generate a unique TenantId after multiple attempts");
    }

    const organizations = dto.Organizations || [];

    if (organizations.length === 0) {
        throw new Error("At least one Organization is required to create a tenant");
    }

    const tenant = await repository.create({
        TenantId,
        TenantName: dto.TenantName,
        FinDimSet: dto.FinDimSet,
        Description: dto.Description,
        Connections: dto.Connections || [],
        DBUser: dto.DBUser || [],
        Organizations: organizations,
        IsDeleted: dto.IsDeleted
    });
    const createdDbNames: string[] = [];

    try {
        for (const org of organizations) {
            const dbName = `${dto.TenantName}-${org.OrganizationUnitId}`;

            const conn = await openTenantConnectionByDbName(dbName);
            await initTenantDatabase(conn);

            createdDbNames.push(dbName);
        }
    } catch (err: any) {
        throw new Error(`Failed to initialize tenant databases: ${err.message}`);
    }

    return tenant;
}

export async function getTenants(filters: TenantFilters) {
    return repository.findAllFiltered(filters);
}

export async function getTenant(id: string) {
    const tenant = await repository.findById(id);
    if (!tenant) {
        throw new Error(`Tenant not found: ${id}`);
    }
    return tenant;
}

export async function updateTenant(id: string, dto: any) {
    validateUpdateTenant(dto);

    const tenant = await repository.update(id, dto);
    if (!tenant) {
        throw new Error(`Tenant not found: ${id}`);
    }
    return tenant;
}

export async function deleteTenant(id: string) {
    const tenant = await repository.findById(id);
    if (!tenant) {
        throw new Error(`Tenant not found: ${id}`);
    }


    for (const org of tenant.Organizations || []) {
        try {
            const dbName = `${tenant.TenantName}-${org.OrganizationUnitId}`;
            console.log("dbName",dbName)
            const conn = await openTenantConnectionByDbName(dbName);
            await conn.dropDatabase();
        } catch (err: any) {
            throw new Error(`Failed to clean up tenant database for ${org.OrganizationUnitId}: ${err.message}`);
        }
    }

    return repository.removeDefinitively(id);
}

export async function setTenantArchiveStatus(id: string, isDeleted: boolean) {
    const tenant = await repository.setDeletedStatus(id, isDeleted);
    if (!tenant) {
        throw new Error(`Tenant not found or already in requested state: ${id}`);
    }
    return tenant;
}