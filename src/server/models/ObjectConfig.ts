import { Schema, model, models } from "mongoose";

// ============================================
// SUB-SCHEMAS
// ============================================

const SourceFieldsSchema = new Schema(
    {
        external_id_update_field: { type: String },
        sync_status_field: { type: String },
        id: { type: String },
    },
    { _id: false, strict: false }
);

const SourceSchema = new Schema(
    {
        source_name: { type: String, required: true },
        fields: { type: SourceFieldsSchema, default: () => ({}) },
    },
    { _id: false }
);

const TargetFieldsSchema = new Schema(
    {
        id: { type: String },
        name: { type: String },
    },
    { _id: false, strict: false }
);

const TargetSchema = new Schema(
    {
        target_name: { type: String, required: true },
        fields: { type: TargetFieldsSchema, default: () => ({}) },
    },
    { _id: false }
);


const OperationSchema = new Schema(
    {
        type: { type: String, required: true },
        method: { type: String, required: true },
        source_endpoint: { type: String },
        source_endpoint_configuration: {
            filter: { type: String },
            select: { type: String },
            orderby: { type: String },
        },
        update_externalId_endpoint: { type: String },
        target_endpoint: { type: String },
        purchase_order_endpoint: { type: String },
        organization_identifier_key: { type: String },
    },
    { _id: false, strict: false }
);

const ConfigSchema = new Schema(
    {
        source: { type: SourceSchema, required: true },
        target: { type: TargetSchema, required: true },
        operation: { type: OperationSchema, required: true },
    },
    { _id: false }
);

// ============================================
// MAIN SCHEMA
// ============================================

const ObjectConfigSchema = new Schema(
    {
        DocumentType: { type: String, required: true, default: "config" },
        ObjectType: { type: String, required: true },
        Transaction: {
            type: String,
            required: true,
            enum: ["CREATE", "UPDATE", "DELETE"],
        },
        Config: { type: ConfigSchema, required: true },
        IsDeleted: { type: Boolean, default: false },
    },
    { timestamps: { createdAt: "CreatedAt", updatedAt: "UpdatedAt" } }
);

ObjectConfigSchema.index({ ObjectType: 1 });
ObjectConfigSchema.index({ Transaction: 1 });
ObjectConfigSchema.index({ DocumentType: 1 });
ObjectConfigSchema.index({ CreatedAt: -1 });


export default models.ObjectConfig || model("ObjectConfig", ObjectConfigSchema);