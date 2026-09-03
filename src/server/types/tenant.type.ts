// ============================================
// SUB-TYPES
// ============================================

export interface ConnectionEntry {
    ConnectionSourceId?: string;
    ConnectionSourceName?: string;
    ConnectionTargetId?: string;
    ConnectionTargetName?: string;
    ConnectionGWId?: string;
    ConnectionGWName?: string;
    ConnectionSMTPId?: string;
    ConnectionSMTPName?: string;
}

export interface DBUser {
    Login: string;
    Password: string;
}

export interface ObjectPermission {
    Create: boolean;
    Update: boolean;
}

export interface ObjectType {
    Suppliers: ObjectPermission;
    Accounts: ObjectPermission;
    Customers: ObjectPermission;
    PurchaseDeliveryNotes: ObjectPermission;
    DocumentItems: ObjectPermission;
    DocumentServices: ObjectPermission;
    Invoices: ObjectPermission;
    Analytical: ObjectPermission;
    Payments: ObjectPermission;
}

export interface Referentials {
    Suppliers?: string;
    Customers?: string;
    Accounts?: string;
}

export interface Organization {
    OrganizationUnitId: string;
    ReferentialId: string;
    Referentials: Referentials;
    ExportDocumentItemCode?: string;
    ExportDocumentServiceCode?: string;
    Active: boolean;
    ObjectType: ObjectType;
    CreatedAt: Date;
}

// ============================================
// MAIN TYPE
// ============================================

export interface Tenant {
    TenantId?: string;
    TenantName: string;
    FinDimSet?: number;
    Description?: string;

    Connections: ConnectionEntry[];
    DBUser: DBUser[];
    Organizations: Organization[];

    IsDeleted: boolean;

    CreatedAt: Date;
    UpdatedAt: Date;
}