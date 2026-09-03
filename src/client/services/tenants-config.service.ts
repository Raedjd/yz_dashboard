import {BaseService} from "@client/services/base.service";
import {API_ENDPOINTS} from "@client/constants/api-endpoints";
import {ApiPaginationParams, ApiResponse, ApiResponseDelete, ConfigFilters} from "@/shared/types/shared";
import {Tenant} from "@client/types/tenant";

class TenantService extends BaseService<Tenant> {
    constructor() {
        super(API_ENDPOINTS.TENANTS);
    }

    async getAllTenants(filters?: ConfigFilters): Promise<ApiResponse<Tenant>> {
        const params: ApiPaginationParams = {};

        if (filters?.PageNumber !== undefined) params.PageNumber = filters.PageNumber;
        if (filters?.PageSize !== undefined) params.PageSize = filters.PageSize;
        if (filters?.Search !== undefined) params.Search = filters.Search;
        if (filters?.SortBy) params.SortBy = filters.SortBy;
        if (filters?.SortOrder) params.SortOrder = filters.SortOrder;
        return this.getAll(params);
    }

    async createTenant(data: Tenant): Promise<Tenant> {
        return this.create(data as Partial<Tenant>);
    }

    async updateTenant(id : string ,data: Tenant): Promise<Tenant> {
        return this.update(id, data as Partial<Tenant>);
    }

    async deleteTenant(id: string): Promise<ApiResponseDelete> {
        return this.delete(id) as unknown as Promise<ApiResponseDelete>;
    }

    async setArchiveStatus(id: string, isDeleted: boolean): Promise<Tenant> {
        return this.patch(id, { IsDeleted: isDeleted } as Partial<Tenant>);
    }
}

export const tenantService = new TenantService();