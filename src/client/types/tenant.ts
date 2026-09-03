export type BulkAction = "archive" | "unarchive" | "delete";

export interface TenantConnections {
    ConnectionSourceId: string;
    ConnectionSourceName: string;
    ConnectionTargetId: string;
    ConnectionTargetName: string;
    ConnectionGWId: string;
    ConnectionGWName: string;
    ConnectionSMTPId: string;
    ConnectionSMTPName: string;
}

export interface DBUser { Login: string; Password: string; }

export interface ObjectTypeItem { Create: boolean; Update?: boolean; }
export type OrgObjectType = Record<string, ObjectTypeItem>;

export interface Organization {
    OrganizationUnitId: string;
    ReferentialId: string;
    Referentials: { Suppliers: string; Customers: string; Accounts: string };
    ExportDocumentItemCode: string;
    ExportDocumentServiceCode: string;
    Active: boolean;
    ObjectType: OrgObjectType;
}

export interface ConfiguredType { name: string; hasCreate: boolean; hasUpdate: boolean; }

export interface Tenant {
    id: string;
    TenantName: string;
    FinDimSet: number;
    Description: string;
    Connections: TenantConnections;
    DBUser: DBUser[];
    IsDeleted: boolean;
    Organizations: Organization[];
}