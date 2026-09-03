import { z } from "zod";

export const createConnectionSchema = z.object({
    name: z.string({ required_error: "name is required" }).min(1),
    uri: z.string({ required_error: "uri is required" }).min(1),
    database: z.string({ required_error: "database is required" }).min(1),
});

export type CreateConnectionDto = z.infer<typeof createConnectionSchema>;

export const updateConnectionSchema = z.object({
    name: z.string().min(1).optional(),
    uri: z.string().min(1).optional(),
    database: z.string().min(1).optional(),
    status: z.enum(["connected", "disconnected"]).optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
});

export type UpdateConnectionDto = z.infer<typeof updateConnectionSchema>;

export const testConnectionSchema = z.object({
    uri: z.string({ required_error: "uri is required" }).min(1),
    database: z.string({ required_error: "database is required" }).min(1),
});

export type TestConnectionDto = z.infer<typeof testConnectionSchema>;

const SORTABLE_FIELDS = ["name", "database", "status", "createdAt"] as const;

export const connectionFiltersSchema = z.object({
    PageNumber: z.coerce.number().int().min(0).default(0),
    PageSize: z.coerce.number().int().min(1).max(100).default(10),
    SortBy: z.enum(SORTABLE_FIELDS).default("createdAt"),
    SortOrder: z.enum(["asc", "desc"]).default("desc"),
    Search: z.string().trim().max(100).optional(),
});

export type ConnectionFilters = z.infer<typeof connectionFiltersSchema>;