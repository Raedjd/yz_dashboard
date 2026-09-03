import { z } from "zod";

const SORTABLE_FIELDS = ["name", "tenantId", "status", "createdAt"] as const;

export const tenantFiltersSchema = z.object({
    PageNumber: z.coerce.number().int().min(0).default(0),
    PageSize: z.coerce.number().int().min(1).max(100).default(10),
    SortBy: z.enum(SORTABLE_FIELDS).default("createdAt"),
    SortOrder: z.enum(["asc", "desc"]).default("desc"),
    Search: z.string().trim().max(100).optional(),
});

export type TenantFilters = z.infer<typeof tenantFiltersSchema>;