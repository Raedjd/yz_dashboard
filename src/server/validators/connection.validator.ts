import {
    ConnectionFilters, connectionFiltersSchema,
    CreateConnectionDto,
    createConnectionSchema, TestConnectionDto, testConnectionSchema,
    UpdateConnectionDto,
    updateConnectionSchema
} from "@server/dto/connection.dto";

import {formatZodErrors , ValidationErrorApi} from "@server/utils/validatorError";

export function validateCreateConnection(dto: any): CreateConnectionDto {
    const result = createConnectionSchema.safeParse(dto);
    if (!result.success) throw new ValidationErrorApi(formatZodErrors(result.error));
    return result.data;
}

export function validateUpdateConnection(dto: any): UpdateConnectionDto {
    const result = updateConnectionSchema.safeParse(dto);
    if (!result.success) throw new ValidationErrorApi(formatZodErrors(result.error));
    return result.data;
}

export function validateTestConnection(dto: any): TestConnectionDto {
    const result = testConnectionSchema.safeParse(dto);
    if (!result.success) throw new ValidationErrorApi(formatZodErrors(result.error));
    return result.data;
}

export function validateConnectionFilters(searchParams: URLSearchParams): ConnectionFilters {
    const result = connectionFiltersSchema.safeParse(Object.fromEntries(searchParams));
    if (!result.success) throw new ValidationErrorApi(formatZodErrors(result.error));
    return result.data;
}