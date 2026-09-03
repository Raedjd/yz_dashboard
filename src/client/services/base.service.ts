import { apiClient } from '../shared/client-api/client';
import {ApiPaginationParams, ApiResponse} from "@/shared/types/shared";


export abstract class BaseService<T> {
    protected endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    async getAll(params?: ApiPaginationParams): Promise<ApiResponse<T>> {
        const queryParams = new URLSearchParams();

        if (params?.PageNumber !== undefined) {
            queryParams.append('PageNumber', params?.PageNumber.toString());
        }
        if (params?.PageSize !== undefined) {
            queryParams.append('PageSize', params?.PageSize.toString());
        }
        if (params?.Search) {
            queryParams.append('Search', params?.Search);
        }
        if (params?.SortBy) {
            queryParams.append('SortBy', params?.SortBy);
        }
        if (params?.SortOrder) {
            queryParams.append('SortOrder', params?.SortOrder);
        }

        const url = `${this.endpoint}?${queryParams.toString()}`

        return apiClient.get<ApiResponse<T>>(url);
    }

    async getById(id: string): Promise<T> {
        return apiClient.get<T>(`${this.endpoint}/${id}`);
    }

    async create(data: Partial<T>): Promise<T> {
        return apiClient.post<T>(this.endpoint, data);
    }

    async update(id: string,data: Partial<T>): Promise<T> {
        return apiClient.put<T>(`${this.endpoint}/${id}`, data);
    }

    async patch(id: string,data: Partial<T>): Promise<T> {
        return apiClient.patch<T>(`${this.endpoint}/${id}`, data);
    }

    async delete(id: string): Promise<T> {
        return apiClient.delete<T>(`${this.endpoint}/${id}`);
    }

}
