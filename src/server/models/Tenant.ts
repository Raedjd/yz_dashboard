import { Schema, model, models } from "mongoose";

// ============================================
// SUB-SCHEMAS
// ============================================


const ConnectionEntrySchema = new Schema(
    {
        ConnectionSourceId: { type: String },
        ConnectionSourceName: { type: String },
        ConnectionTargetId: { type: String },
        ConnectionTargetName: { type: String },
        ConnectionGWId: { type: String },
        ConnectionGWName: { type: String },
        ConnectionSMTPId: { type: String },
        ConnectionSMTPName: { type: String },
    },
    { _id: false }
);

const DBUserSchema = new Schema(
    {
        Login: { type: String, required: true },
        Password: { type: String, required: true },
    },
    { _id: false }
);


const ObjectPermissionSchema = new Schema(
    {
        Create: { type: Boolean, default: false },
        Update: { type: Boolean, default: false },
    },
    { _id: false }
);

const ObjectTypeSchema = new Schema(
    {
        Suppliers: { type: ObjectPermissionSchema, default: () => ({}) },
        Accounts: { type: ObjectPermissionSchema, default: () => ({}) },
        Customers: { type: ObjectPermissionSchema, default: () => ({}) },
        PurchaseDeliveryNotes: { type: ObjectPermissionSchema, default: () => ({}) },
        DocumentItems: { type: ObjectPermissionSchema, default: () => ({}) },
        DocumentServices: { type: ObjectPermissionSchema, default: () => ({}) },
        Invoices: { type: ObjectPermissionSchema, default: () => ({}) },
        Analytical: { type: ObjectPermissionSchema, default: () => ({}) },
        Payments: { type: ObjectPermissionSchema, default: () => ({}) },
    },
    { _id: false }
);

const ReferentialsSchema = new Schema(
    {
            Suppliers: { type: String },
            Customers: { type: String },
            Accounts: { type: String },
    },
    { _id: false}
);


const OrganizationSchema = new Schema(
    {
            OrganizationUnitId: { type: String, required: true },
            ReferentialId: { type: String, required: true },
            Referentials: { type: ReferentialsSchema, default: () => ({}) },
            ExportDocumentItemCode: { type: String },
            ExportDocumentServiceCode: { type: String },
            Active: { type: Boolean, default: false },
            ObjectType: { type: ObjectTypeSchema, default: () => ({}) },
            CreatedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

// ============================================
// MAIN SCHEMA
// ============================================
const TenantSchema = new Schema(
    {   TenantId:{ type: String},
        TenantName: { type: String, required: true },
        FinDimSet: { type: Number },
        Description: { type: String },
        Connections: { type: [ConnectionEntrySchema], default: [] },
        DBUser: { type: [DBUserSchema], default: [] },
        Organizations: { type: [OrganizationSchema], default: [] },
        IsDeleted: { type: Boolean, default: false },
    },
    { timestamps: { createdAt: "CreatedAt", updatedAt: "UpdatedAt" } }
);

TenantSchema.index({ TenantName: 1 });
TenantSchema.index({ CreatedAt: -1 });

export default models.Tenant || model("Tenant", TenantSchema);