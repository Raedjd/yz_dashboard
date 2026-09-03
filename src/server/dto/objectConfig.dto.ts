import { z } from "zod";

// ============================================
// SUB-SCHEMAS
// ============================================

const sourceFieldsSchema = z.object({
    external_id_update_field: z.string().optional(),
    sync_status_field: z.string().optional(),
    id: z.string().optional(),
}).catchall(z.any());

const sourceSchema = z.object({
    source_name: z.string({ required_error: "source_name is required" }).min(1),
    fields: sourceFieldsSchema.default({}),
});

const targetFieldsSchema = z.object({
    id: z.string().optional(),
    name: z.string().optional(),
}).catchall(z.any());

const targetSchema = z.object({
    target_name: z.string({ required_error: "target_name is required" }).min(1),
    fields: targetFieldsSchema.default({}),
});

const sourceEndpointConfigurationSchema = z.object({
    filter: z.string().optional(),
    select: z.string().optional(),
    orderby: z.string().optional(),
}).optional();

const operationSchema = z.object({
    type: z.string({ required_error: "operation.type is required" }).min(1),
    method: z.string({ required_error: "operation.method is required" }).min(1),
    source_endpoint: z.string().optional(),
    source_endpoint_configuration: sourceEndpointConfigurationSchema,
    update_externalId_endpoint: z.string().optional(),
    target_endpoint: z.string().optional(),
    purchase_order_endpoint: z.string().optional(),
    organization_identifier_key: z.string().optional(),
}).catchall(z.any());

const configSchema = z.object({
    source: sourceSchema,
    target: targetSchema,
    operation: operationSchema,
});

// ============================================
// CREATE
// ============================================

export const createObjectConfigSchema = z.object({
    DocumentType: z.string().default("config"),
    ObjectType: z.string({ required_error: "ObjectType is required" }).min(1),
    Transaction: z.enum(["CREATE", "UPDATE", "DELETE"], {
        required_error: "Transaction is required",
    }),
    Config: configSchema,
});

export type CreateObjectConfigDto = z.infer<typeof createObjectConfigSchema>;

// ============================================
// UPDATE
// ============================================

export const updateObjectConfigSchema = z.object({
    DocumentType: z.string().optional(),
    ObjectType: z.string().min(1).optional(),
    Transaction: z.enum(["CREATE", "UPDATE", "DELETE"]).optional(),
    Config: configSchema.partial().optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
});

export type UpdateObjectConfigDto = z.infer<typeof updateObjectConfigSchema>;

// ============================================
// FILTERS
// ============================================

const SORTABLE_FIELDS = ["ObjectType", "DocumentType", "Transaction", "CreatedAt"] as const;

export const objectConfigFiltersSchema = z.object({
    PageNumber: z.coerce.number().int().min(0).default(0),
    PageSize: z.coerce.number().int().min(1).max(100).default(10),
    SortBy: z.enum(SORTABLE_FIELDS).default("CreatedAt"),
    SortOrder: z.enum(["asc", "desc"]).default("desc"),
    Search: z.string().trim().max(100).optional(),
});

export type ObjectConfigFilters = z.infer<typeof objectConfigFiltersSchema>;