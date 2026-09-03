import {BaseService} from "@client/services/base.service";
import {API_ENDPOINTS} from "@client/constants/api-endpoints";
import {ApiPaginationParams, ApiResponse, ApiResponseDelete, ConfigFilters} from "@/shared/types/shared";
import {Connection, CreateConnectionInput, TestConnectionResponse} from "@client/types/connection";
import {apiClient} from "@client/shared/client-api/client";

class ConnectionService extends BaseService<Connection> {
    constructor() {
        super(API_ENDPOINTS.CONNECTIONS);
    }

    async getAllConnections(filters?: ConfigFilters): Promise<ApiResponse<Connection>> {
        const params: ApiPaginationParams = {};

        if (filters?.PageNumber !== undefined) params.PageNumber = filters.PageNumber;
        if (filters?.PageSize !== undefined) params.PageSize = filters.PageSize;
        if (filters?.Search !== undefined) params.Search = filters.Search;
        if (filters?.SortBy) params.SortBy = filters.SortBy;
        if (filters?.SortOrder) params.SortOrder = filters.SortOrder;
        console.log("parms",params)
        return this.getAll(params);
    }

    async createConnection(data: CreateConnectionInput): Promise<Connection> {
        return this.create(data as Partial<Connection>);
    }

    async patchConnection(id : string ,data: Connection): Promise<Connection> {
        return this.patch(id, data as Partial<Connection>);
    }

    async deleteConnection(id: string): Promise<ApiResponseDelete> {
        return this.delete(id) as unknown as Promise<ApiResponseDelete>;
    }

    async testConnextion(id: string): Promise<TestConnectionResponse> {
        const url = `${this.endpoint}/${id}/test`;
        return apiClient.post(url,{});
    }

}

export const connectionService = new ConnectionService();