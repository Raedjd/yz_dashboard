import {
    ObjectConfigFilters, objectConfigFiltersSchema,
    CreateObjectConfigDto,
    createObjectConfigSchema,
    UpdateObjectConfigDto,
    updateObjectConfigSchema
} from "@server/dto/objectConfig.dto";

import { formatZodErrors, ValidationErrorApi } from "@server/utils/validatorError";

export function validateCreateObjectConfig(dto: any): CreateObjectConfigDto {
    const result = createObjectConfigSchema.safeParse(dto);
    if (!result.success) throw new ValidationErrorApi(formatZodErrors(result.error));
    return result.data;
}

export function validateUpdateObjectConfig(dto: any): UpdateObjectConfigDto {
    const result = updateObjectConfigSchema.safeParse(dto);
    if (!result.success) throw new ValidationErrorApi(formatZodErrors(result.error));
    return result.data;
}

export function validateObjectConfigFilters(searchParams: URLSearchParams): ObjectConfigFilters {
    const result = objectConfigFiltersSchema.safeParse(Object.fromEntries(searchParams));
    if (!result.success) throw new ValidationErrorApi(formatZodErrors(result.error));
    return result.data;
}