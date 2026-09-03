export type TransactionType = "CREATE" | "UPDATE" | "DELETE";

export interface SourceFields {
    external_id_update_field?: string;
    sync_status_field?: string;
    id?: string;
    [key: string]: string | undefined;
}

export interface Source {
    source_name: string;
    fields: SourceFields;
}

export interface TargetFields {
    id?: string;
    name?: string;
    [key: string]: string | undefined;
}

export interface Target {
    target_name: string;
    fields: TargetFields;
}

export interface SourceEndpointConfiguration {
    filter?: string;
    select?: string;
    orderby?: string;
}

export interface Operation {
    type: string;
    method: string;
    source_endpoint?: string;
    source_endpoint_configuration?: SourceEndpointConfiguration;
    update_externalId_endpoint?: string;
    target_endpoint?: string;
    purchase_order_endpoint?: string;
    organization_identifier_key?: string;
    [key: string]: any;
}

export interface Config {
    source: Source;
    target: Target;
    operation: Operation;
}

export interface ObjectConfig {
    id: string;
    DocumentType: string;
    ObjectType: string;
    Transaction: TransactionType;
    Config: Config;
    IsDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}