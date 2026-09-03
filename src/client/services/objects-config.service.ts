import {BaseService} from "@client/services/base.service";
import {API_ENDPOINTS} from "@client/constants/api-endpoints";
import {ApiPaginationParams, ApiResponse, ApiResponseDelete, ConfigFilters} from "@/shared/types/shared";
import {ObjectConfig} from "@client/types/objectConfig";

class ObjectConfigService extends BaseService<ObjectConfig> {
    constructor() {
        super(API_ENDPOINTS.OBJECTS_CONFIG);
    }

    async getAllObjectConfigs(filters?: ConfigFilters): Promise<ApiResponse<ObjectConfig>> {
        const params: ApiPaginationParams = {};

        if (filters?.PageNumber !== undefined) params.PageNumber = filters.PageNumber;
        if (filters?.PageSize !== undefined) params.PageSize = filters.PageSize;
        if (filters?.Search !== undefined) params.Search = filters.Search;
        if (filters?.SortBy) params.SortBy = filters.SortBy;
        if (filters?.SortOrder) params.SortOrder = filters.SortOrder;
        console.log("parms",params)
        return this.getAll(params);
    }

    async createObjectConfig(data: ObjectConfig): Promise<ObjectConfig> {
        return this.create(data as Partial<ObjectConfig>);
    }

    async updateObjectConfig(id : string ,data: ObjectConfig): Promise<ObjectConfig> {
        return this.update(id, data as Partial<ObjectConfig>);
    }

    async deleteObjectConfig(id: string): Promise<ApiResponseDelete> {
        return this.delete(id) as unknown as Promise<ApiResponseDelete>;
    }

    async setArchiveStatus(id: string, isDeleted: boolean): Promise<ObjectConfig> {
        return this.patch(id, { IsDeleted: isDeleted } as Partial<ObjectConfig>);
    }

}

export const objectConfigService = new ObjectConfigService();