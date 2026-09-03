'use client';

import { useEffect, useState } from "react";
import { Loader2, Plus, RefreshCw } from "lucide-react";

import { useConnection } from "@client/hooks/useConnectionHook";
import { useToast } from "@client/shared/hooks/use-toast";

import { ConnectionCard } from "@client/components/dashboard/administrations/connections/ConnectionCard";
import Pagination from "@client/shared/components/Pagination";
import DeleteDialog from "@client/shared/components/DeleteDialog";


import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@client/shared/components/ui/dialog";
import { Button } from "@client/shared/components/ui/button";
import { Label } from "@client/shared/components/ui/label";
import { Input } from "@client/shared/components/ui/input";
import SearchBar from "@client/shared/components/SearchBar";
import {useSnackbar} from "@client/shared/hooks/useSnackbar";
import Snackbar from "@client/shared/components/Snackbar";

export default function Connections() {
    // ============================================
    // STATE — filters / pagination
    // ============================================
    const [filters, setFilters] = useState({
        PageNumber: 0,
        PageSize: 9,
        Search: '',
        SortBy: 'createdAt',
        SortOrder: 'desc' as 'asc' | 'desc',
    });
    const [searchValue, setSearchValue] = useState('');
    // ============================================
    // STATE — "Add Connection" dialog
    // ============================================
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        uri: '',
        database: '',
    });

    // ============================================
    // STATE — "Delete Connection" dialog
    // ============================================
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // ============================================
    // HOOKS
    // ============================================
    const {
        connections,
        loadingConnections,
        paginationConnections,
        fetchConnections,
        createConnection,
        testConnection,
        deleteConnectionById,
    } = useConnection();

    const {
        snackbar,
        snackbarSuccess,
        snackbarError,
        hideSnackbar
    } = useSnackbar();

    const { toast } = useToast();

    // ============================================
    // EFFECTS
    // ============================================
    useEffect(() => {
        fetchConnections(filters);
    }, [filters, fetchConnections]);

    // ============================================
    // DERIVED VALUES
    // ============================================
    const totalPages = Math.ceil(paginationConnections.TotalCount / filters.PageSize);

    // ============================================
    // HANDLERS — list / pagination / search / refresh
    // ============================================

    const handleSearch = (value: string) => {
        setSearchValue(value);
        setFilters(prev => ({
            ...prev,
            Search: value,
            PageNumber: 0,
        }));
    };

    const handleRefresh = () => {
        fetchConnections(filters);
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({
            ...prev,
            PageNumber: newPage,
        }));
    };


    // ============================================
    // HANDLERS — create connection
    // ============================================
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            await createConnection(formData);
            setOpen(false);
            setFormData({
                name: "",
                uri: "",
                database: "",
            });

            await fetchConnections(filters);
            snackbarSuccess('Connection added successfully!');

        } catch (error) {
            console.error(error);
            snackbarError('Failed to add connection')
        }
    };

    // ============================================
    // HANDLERS — delete connection
    // ============================================
    const handleDelete = (id: string) => {
        setItemToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        setIsDeleting(true);
        try {
            const res = await deleteConnectionById(itemToDelete);

            if (res) {
                snackbarSuccess('Connection deleted successfully!')
                await fetchConnections(filters);
            } else {
                snackbarError('Failed to delete connection. Please try again')
            }

            setDeleteDialogOpen(false);
            setItemToDelete(null);
        } catch (err) {
            snackbarError('Failed to delete connection. Please try again')
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    // ============================================
    // HANDLERS — test connection
    // ============================================

    const handleTest = async (id: string) => {
        if (!id) return;

        try {
            const res = await testConnection(id);

            if (res?.success) {
                snackbarSuccess('Connection test successful')
            } else {
                snackbarError("Failed to connect to the server.");
            }
        } catch (err) {
            snackbarError('Failed to test connection. Please try again')
        }
    };


    // ============================================
    // RENDER
    // ============================================
    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className="space-y-6">
                {/* ========== HEADER ========== */}
                <div className="flex items-center justify-between" data-tour="connections-header">
                    <div>
                        <h1 className="text-2xl font-semibold">Connections</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage MongoDB connections for each tenant
                        </p>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        {/* ---- Refresh + Add Connection trigger ---- */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleRefresh}
                                disabled={loadingConnections}
                                className="p-2.5 text-muted-foreground hover:text-primary hover:bg-accent rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover-elevate"
                                title="Refresh"
                            >
                                <RefreshCw size={20} className={loadingConnections ? 'animate-spin' : ''} />
                            </button>

                            <DialogTrigger asChild>
                                <Button data-testid="button-add-connection">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Connection
                                </Button>
                            </DialogTrigger>
                        </div>

                        {/* ---- Add Connection form ---- */}
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Add New Connection</DialogTitle>
                                <DialogDescription>
                                    Configure a new MongoDB connection for a tenant
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Tenant Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Production EU"
                                        required
                                        data-testid="input-tenant-name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="uri">MongoDB URI</Label>
                                    <Input
                                        id="uri"
                                        type="password"
                                        value={formData.uri}
                                        onChange={(e) => setFormData({ ...formData, uri: e.target.value })}
                                        placeholder="mongodb+srv://..."
                                        required
                                        data-testid="input-mongodb-uri"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="database">Database Name</Label>
                                    <Input
                                        id="database"
                                        value={formData.database}
                                        onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                                        placeholder="e.g., yooz_production"
                                        required
                                        data-testid="input-database-name"
                                    />
                                </div>

                                <div className="flex gap-2 justify-end pt-4">
                                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" data-testid="button-save-connection">
                                        Save Connection
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* ========== SEARCH BAR ========== */}
                <SearchBar
                    value={searchValue}
                    onSearch={handleSearch}
                    placeholder="Search connections..."
                />

                {/* ========== CONTENT ========== */}
                {loadingConnections ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Loading connections...</p>
                    </div>
                ) : connections.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground mb-4">No connections configured</p>
                        <p className="text-sm text-muted-foreground">Click "Add Connection" to get started</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {connections.map((connection) => (
                                <ConnectionCard
                                    data-tour="connection-card"
                                    key={connection.id}
                                    connection={connection}
                                    onTest={handleTest}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>

                        <Pagination
                            currentPage={filters.PageNumber}
                            totalItems={paginationConnections.TotalCount}
                            pageSize={filters.PageSize}
                            totalPages={totalPages}
                            loading={loadingConnections}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>

            {/* ========== DELETE DIALOG ========== */}
            <DeleteDialog
                isOpen={deleteDialogOpen}
                isDeleting={isDeleting}
                title="Confirm Deletion"
                message="Are you sure you want to delete this connection?"
                warningMessage="This action cannot be undone and will permanently remove the connection from your system."
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
            {/* ========== SNACKBAR ========== */}
            <Snackbar
                message={snackbar.message}
                type={snackbar.type}
                isVisible={snackbar.isVisible}
                onClose={hideSnackbar}
            />
        </div>
    );
}