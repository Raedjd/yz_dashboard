import {useState, useCallback} from 'react';;
import {ApiResponse, ConfigFilters} from "@/shared/types/shared";
import {connectionService} from "@client/services/connections.service";
import {Connection, CreateConnectionInput, TestConnectionResponse} from "@client/types/connection";

export function useConnection(initialFilters?: ConfigFilters) {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loadingConnections, setLoadingConnections] = useState(false);
    const [errorConnections, setErrorConnections] = useState<string | null>(null);
    const [paginationConnections, setPaginationConnections] = useState({
        TotalCount: 0,
        PageNumber: 0,
        PageSize: 10,
    });

    const fetchConnections = useCallback(async (filters?: ConfigFilters) => {
        setLoadingConnections(true);
        setErrorConnections(null);

        console.log("filters",filters)
        try {
            const response: ApiResponse<Connection> = await connectionService.getAllConnections(filters || initialFilters || {});

            setConnections(response.Items);
            setPaginationConnections({
                TotalCount: response.TotalCount,
                PageNumber: response.PageNumber,
                PageSize: response.PageSize,
            });
        } catch (err: any) {
            setErrorConnections(err.message || 'Error loading connections');
        } finally {
            setLoadingConnections(false);
        }
    }, []);

    const createConnection = async (data: CreateConnectionInput): Promise<Connection | null> => {
        setLoadingConnections(true);
        setErrorConnections(null);
        try {
            const newItem = await connectionService.createConnection(data);
            return newItem;
        } catch (err: any) {
            setErrorConnections(err.message || 'Error creating Connection');
            return null;
        } finally {
            setLoadingConnections(false);
        }
    };

    const patchConnection = async (id : string,data: Connection): Promise<Connection | null> => {
        setLoadingConnections(true);
        setErrorConnections(null);
        try {
            const updatedItem = await connectionService.patchConnection(id,data);
            return updatedItem;
        } catch (err: any) {
            setErrorConnections(err.message || 'Error patching Connection');
            return null;
        } finally {
            setLoadingConnections(false);
        }
    };

    const deleteConnectionById = async (id: string): Promise<boolean> => {
        setLoadingConnections(true);
        setErrorConnections(null);
        try {
          const res=  await connectionService.deleteConnection(id);
          return res.success;
        } catch (err: any) {
            setErrorConnections(err.message || 'Error deleting Connection');
            return false;
        } finally {
            setLoadingConnections(false);
        }
    };

    const testConnection = async (id:string): Promise<TestConnectionResponse | null> => {
        try {
            const newItem = await connectionService.testConnextion(id);
            return newItem;
        } catch (err: any) {
            return null;
        }
    };

    return {
        connections,
        loadingConnections,
        errorConnections,
        paginationConnections,
        fetchConnections,
        createConnection,
        deleteConnectionById,
        testConnection
    };
}