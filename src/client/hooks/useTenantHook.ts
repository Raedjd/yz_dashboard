import {useState, useCallback} from 'react';;
import {ApiResponse, ConfigFilters} from "@/shared/types/shared";
import {Tenant} from "@client/types/tenant";
import {tenantService} from "@client/services/tenants-config.service";


export function useTenant(initialFilters?: ConfigFilters) {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loadingTenants, setLoadingTenants] = useState(false);
    const [errorTenants, setErrorTenants] = useState<string | null>(null);
    const [paginationTenants, setPaginationTenants] = useState({
        TotalCount: 0,
        PageNumber: 0,
        PageSize: 10,
    });

    // ============================================
    // STATE — object configs (types configurés)
    // ============================================
    const [rawConfigs, setRawConfigs] = useState<any[]>([]);
    const [loadingConfigs, setLoadingConfigs] = useState(false);
    const [errorConfigs, setErrorConfigs] = useState<string | null>(null);

    const fetchTenants = useCallback(async (filters?: ConfigFilters) => {
        setLoadingTenants(true);
        setErrorTenants(null);

        try {
            const response: ApiResponse<Tenant> = await tenantService.getAllTenants(filters || initialFilters || {});

            setTenants(response.Items);
            setPaginationTenants({
                TotalCount: response.TotalCount,
                PageNumber: response.PageNumber,
                PageSize: response.PageSize,
            });
        } catch (err: any) {
            setErrorTenants(err.message || 'Error loading Tenants');
        } finally {
            setLoadingTenants(false);
        }
    }, []);

    const fetchObjectConfigs = useCallback(async () => {
        setLoadingConfigs(true);
        setErrorConfigs(null);

        try {
         //   const configs = await tenantService.getObjectConfigs();
          //  setRawConfigs(configs);
        } catch (err: any) {
            setErrorConfigs(err.message || 'Error loading object configs');
        } finally {
            setLoadingConfigs(false);
        }
    }, []);

    const createTenant = async (data: Tenant): Promise<Tenant | null> => {
        setLoadingTenants(true);
        setErrorTenants(null);
        try {
            const newItem = await tenantService.createTenant(data);
            return newItem;
        } catch (err: any) {
            setErrorTenants(err.message || 'Error creating Tenant');
            return null;
        } finally {
            setLoadingTenants(false);
        }
    };

    const updateTenant = async (id: string, data: Tenant): Promise<Tenant | null> => {
        setLoadingTenants(true);
        setErrorTenants(null);
        try {
            const updatedItem = await tenantService.updateTenant(id, data);
            return updatedItem;
        } catch (err: any) {
            setErrorTenants(err.message || 'Error updating Tenant');
            return null;
        } finally {
            setLoadingTenants(false);
        }
    };

    const archiveTenant = async (id: string): Promise<boolean> => {
        setLoadingTenants(true);
        setErrorTenants(null);
        try {
            const res = await tenantService.setArchiveStatus(id, true);
            return !!res;
        } catch (err: any) {
            setErrorTenants(err.message || 'Error archiving Tenant');
            return false;
        } finally {
            setLoadingTenants(false);
        }
    };

    const unarchiveTenant = async (id: string): Promise<boolean> => {
        setLoadingTenants(true);
        setErrorTenants(null);
        try {
            const res = await tenantService.setArchiveStatus(id, false);
            return !!res;
        } catch (err: any) {
            setErrorTenants(err.message || 'Error unarchiving Tenant');
            return false;
        } finally {
            setLoadingTenants(false);
        }
    };

    const deleteTenantById = async (id: string): Promise<boolean> => {
        setLoadingTenants(true);
        setErrorTenants(null);
        try {
            const res = await tenantService.deleteTenant(id);
            return res.success;
        } catch (err: any) {
            setErrorTenants(err.message || 'Error deleting Tenant');
            return false;
        } finally {
            setLoadingTenants(false);
        }
    };

    return {
        tenants,
        loadingTenants,
        errorTenants,
        paginationTenants,
        fetchTenants,
        createTenant,
        updateTenant,
        archiveTenant,
        unarchiveTenant,
        deleteTenantById,
        rawConfigs,
        loadingConfigs,
        errorConfigs,
        fetchObjectConfigs,
    };
}