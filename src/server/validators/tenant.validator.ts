import { z } from "zod";
import { formatZodErrors, ValidationErrorApi } from "@/server/utils/validatorError";
import {TenantFilters, tenantFiltersSchema} from "@server/dto/tenant-filters.dto";

export const createTenantSchema = z.object({
    TenantName: z.string({
        required_error: "TenantName is required",
        invalid_type_error: "tenantName must be a string",
    }),
});

export type CreateTenantDto = z.infer<typeof createTenantSchema>;

export function validateCreateTenant(dto: any): CreateTenantDto {
    const result = createTenantSchema.safeParse(dto);
    if (!result.success) {
        throw new ValidationErrorApi(formatZodErrors(result.error));
    }
    return result.data;
}

export const updateTenantSchema = z.object({
    tenantName: z
        .string({
            invalid_type_error: "tenantName must be a string",
        })
        .min(1, "tenantName cannot be empty")
        .optional(),
});

export type UpdateTenantDto = z.infer<typeof updateTenantSchema>;

export function validateUpdateTenant(dto: any): UpdateTenantDto {
    const result = updateTenantSchema.safeParse(dto);
    if (!result.success) {
        throw new ValidationErrorApi(formatZodErrors(result.error));
    }
    return result.data;
}

export function validateTenantFilters(searchParams: URLSearchParams): TenantFilters {
    const result = tenantFiltersSchema.safeParse(Object.fromEntries(searchParams));
    if (!result.success) throw new ValidationErrorApi(formatZodErrors(result.error));
    return result.data;
}