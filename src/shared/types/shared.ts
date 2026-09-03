export interface ApiPaginationParams {
    PageNumber?: number;
    PageSize?: number;
    Search?: string;
    SortBy?: string;
    SortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
    Items: T[];
    TotalCount: number;
    PageNumber: number;
    PageSize: number;
}

export interface ConfigFilters {
    PageNumber?: number;
    PageSize?: number;
    SortBy?: string;
    SortOrder?: 'asc' | 'desc';
    Search?: string;
}

export interface ApiResponseDelete {
    success: boolean;
}