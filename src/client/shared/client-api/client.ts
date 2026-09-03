import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse,InternalAxiosRequestConfig } from 'axios';

import * as https from "node:https";
import {getTenantId, getTokenFromSession, isTokenExpired, logout} from "@client/services/authorization/auth";


class ApiClient {
    private client: AxiosInstance;
    private baseURL: string;


    constructor() {
        this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
        const timeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10);

        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: timeout,
        });

        this.client.interceptors.request.use(
            (config,) => this.setAuthorizeHeader(config),
            (error) => Promise.reject(error)
        );

    }


    private async setAuthorizeHeader(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
        try {
            const tokenState = getTokenFromSession()
            const tenantState = getTenantId()


            if(isTokenExpired()){
                logout();
            }

            if (tenantState) {
                config.headers['X-Company-Db'] = tenantState;
            }

            if (tokenState) {
                config.headers.Authorization = `Bearer ${tokenState}`;
            }

            return config;
        } catch (error) {
            console.error('Error setting auth header:', error);
            throw error;
        }
    }

    // ==================== Méthodes HTTP publiques ====================

    async get<T>(url: string, config: AxiosRequestConfig = {}): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.client.get(url, config);
            return response.data;
        } catch (error) {
            console.error(`[API GET ERROR] ${url}:`, error);
            throw error;
        }
    }

    async post<T>(url: string, data?: any, config: AxiosRequestConfig = {}): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.client.post(url, data, config);
            return response.data;
        } catch (error) {
            console.error(`[API POST ERROR] ${url}:`, error);
            throw error;
        }
    }

    async put<T>(url: string, data?: any, config: AxiosRequestConfig = {}): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.client.put(url, data, config);
            console.log(`[API PUT] ${url} - Status: ${response.status}`);
            return response.data;
        } catch (error) {
            console.error(`[API PUT ERROR] ${url}:`, error);
            throw error;
        }
    }

    async patch<T>(url: string, data?: any, config: AxiosRequestConfig = {}): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.client.patch(url, data, config);
            console.log(`[API PATCH] ${url} - Status: ${response.status}`);
            return response.data;
        } catch (error) {
            console.error(`[API PATCH ERROR] ${url}:`, error);
            throw error;
        }
    }
    async delete<T>(url: string, data?: any, config: AxiosRequestConfig = {}): Promise<T> {
        try {
            const deleteConfig: AxiosRequestConfig = {
                ...config,
                ...(data && { data }),
            };

            const response: AxiosResponse<T> = await this.client.delete(url, deleteConfig);
            return response.data;
        } catch (error) {
            console.error(`DELETE ${url} failed:`, error);
            throw error;
        }
    }

}

// Export singleton
export const apiClient = new ApiClient();