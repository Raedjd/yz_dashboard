import {useState, useCallback} from 'react';
import {ApiResponse, ConfigFilters} from "@/shared/types/shared";
import {ObjectConfig} from "@client/types/objectConfig";
import {objectConfigService} from "@client/services/objects-config.service";


export function useObjectConfig(initialFilters?: ConfigFilters) {
    const [objectConfigs, setObjectConfigs] = useState<ObjectConfig[]>([]);
    const [loadingObjectConfigs, setLoadingObjectConfigs] = useState(false);
    const [errorObjectConfigs, setErrorObjectConfigs] = useState<string | null>(null);
    const [paginationObjectConfigs, setPaginationObjectConfigs] = useState({
        TotalCount: 0,
        PageNumber: 0,
        PageSize: 10,
    });


    const fetchObjectConfigs = useCallback(async (filters?: ConfigFilters) => {
        setLoadingObjectConfigs(true);
        setErrorObjectConfigs(null);

        try {
            const response: ApiResponse<ObjectConfig> = await objectConfigService.getAllObjectConfigs(filters || initialFilters || {});

            setObjectConfigs(response.Items);
            setPaginationObjectConfigs({
                TotalCount: response.TotalCount,
                PageNumber: response.PageNumber,
                PageSize: response.PageSize,
            });
        } catch (err: any) {
            setErrorObjectConfigs(err.message || 'Error loading ObjectConfigs');
        } finally {
            setLoadingObjectConfigs(false);
        }
    }, []);



    const createObjectConfig = async (data: ObjectConfig): Promise<ObjectConfig | null> => {
        setLoadingObjectConfigs(true);
        setErrorObjectConfigs(null);
        try {
            const newItem = await objectConfigService.createObjectConfig(data);
            return newItem;
        } catch (err: any) {
            setErrorObjectConfigs(err.message || 'Error creating ObjectConfig');
            return null;
        } finally {
            setLoadingObjectConfigs(false);
        }
    };

    const updateObjectConfig = async (id: string, data: ObjectConfig): Promise<ObjectConfig | null> => {
        setLoadingObjectConfigs(true);
        setErrorObjectConfigs(null);
        try {
            const updatedItem = await objectConfigService.updateObjectConfig(id, data);
            return updatedItem;
        } catch (err: any) {
            setErrorObjectConfigs(err.message || 'Error updating ObjectConfig');
            return null;
        } finally {
            setLoadingObjectConfigs(false);
        }
    };


    const deleteObjectConfigById = async (id: string): Promise<boolean> => {
        setLoadingObjectConfigs(true);
        setErrorObjectConfigs(null);
        try {
            const res = await objectConfigService.deleteObjectConfig(id);
            return res.success;
        } catch (err: any) {
            setErrorObjectConfigs(err.message || 'Error deleting ObjectConfig');
            return false;
        } finally {
            setLoadingObjectConfigs(false);
        }
    };

    const archiveObjectConfig = async (id: string): Promise<boolean> => {
        setLoadingObjectConfigs(true);
        setErrorObjectConfigs(null);
        try {
            const res = await objectConfigService.setArchiveStatus(id, true);
            return !!res;
        } catch (err: any) {
            setErrorObjectConfigs(err.message || 'Error archiving ObjectConfig');
            return false;
        } finally {
            setLoadingObjectConfigs(false);
        }
    };

    const unarchiveObjectConfig = async (id: string): Promise<boolean> => {
        setLoadingObjectConfigs(true);
        setErrorObjectConfigs(null);
        try {
            const res = await objectConfigService.setArchiveStatus(id, false);
            return !!res;
        } catch (err: any) {
            setErrorObjectConfigs(err.message || 'Error unarchiving ObjectConfig');
            return false;
        } finally {
            setLoadingObjectConfigs(false);
        }
    };


    return {
        objectConfigs,
        loadingObjectConfigs,
        errorObjectConfigs,
        paginationObjectConfigs,
        fetchObjectConfigs,
        createObjectConfig,
        updateObjectConfig,
        deleteObjectConfigById,
        archiveObjectConfig,
        unarchiveObjectConfig
    };
}