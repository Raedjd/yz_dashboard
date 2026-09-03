export interface Connection {
    id: string;
    name: string;
    uri: string;
    database: string;
    status: string;
    deleted: boolean;
    createdAt: string
    updatedAt: string;
}

export type CreateConnectionInput = Pick<Connection, 'name' | 'uri' | 'database'>;

export interface TestConnectionResponse {
    success: boolean;
    message: string;
    latencyMs: number;
    status: 'success' | 'error';
}