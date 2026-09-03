import { useEffect, useMemo, useState } from "react";
import { useTenant } from "@client/hooks/useTenantHook";

import {
    Plus,
    Archive,
    ArchiveRestore,
    Trash2,
    ShieldOff,
    Loader2,
    Building2,
    Database,
    Users,
    ServerCog,
    RefreshCw,
    Search
} from "lucide-react";

import {useSnackbar} from "@client/shared/hooks/useSnackbar";
import {Button} from "@client/shared/components/ui/button";
import SearchBar from "@client/shared/components/SearchBar";
import {Checkbox} from "@radix-ui/react-checkbox";
import {TenantCard} from "@client/components/dashboard/administrations/tenants-config/TenantCard";
import Pagination from "@/client/shared/components/Pagination";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle} from "@client/shared/components/ui/sheet";
import {ScrollArea} from "@client/shared/components/ui/scroll-area";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@client/shared/components/ui/accordion";
import {Label} from "@client/shared/components/ui/label";
import {Input} from "@client/shared/components/ui/input";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@client/shared/components/ui/alert-dialog";
import {BulkAction, ConfiguredType, ObjectTypeItem, Organization, OrgObjectType, Tenant} from "@client/types/tenant";
import {Switch} from "@client/shared/components/ui/switch";



// ════════════════════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════════════════════

function makeDefaultOrg(configuredTypes: ConfiguredType[]): Organization {
    const ObjectType: OrgObjectType = {};
    for (const ct of configuredTypes) {
        ObjectType[ct.name] = { Create: false, ...(ct.hasUpdate ? { Update: false } : {}) };
    }
    return {
        OrganizationUnitId: "",
        ReferentialId: "",
        Referentials: { Suppliers: "YZ_SUPPLIER", Customers: "YZ_CUSTOMER", Accounts: "YZ_ACCOUNT" },
        ExportDocumentItemCode: "YZ_IBS_SAPB1",
        ExportDocumentServiceCode: "YZ_GENERIC_V2",
        Active: true,
        ObjectType,
    };
}

function makeDefaultTenant(configuredTypes: ConfiguredType[]): Tenant {
    return {
        TenantName: "",
        FinDimSet: 0,
        Description: "",
        Connections: {
            ConnectionSourceId: "", ConnectionSourceName: "SAP B1 Connection",
            ConnectionTargetId: "", ConnectionTargetName: "Yooz",
            ConnectionGWId: "",     ConnectionGWName: "SAP B1 Gateway",
            ConnectionSMTPId: "",   ConnectionSMTPName: "SMTP",
        },
        DBUser: [{ Login: "", Password: "" }],
        IsDeleted: false,
        Organizations: [makeDefaultOrg(configuredTypes)],
    };
}

function toApiFormat(t: Tenant) {
    const { Connections, ...rest } = t;
    return {
        ...rest,
        Connections: [
            { ConnectionSourceId: Connections.ConnectionSourceId, ConnectionSourceName: Connections.ConnectionSourceName },
            { ConnectionTargetId: Connections.ConnectionTargetId, ConnectionTargetName: Connections.ConnectionTargetName },
            { ConnectionGWId: Connections.ConnectionGWId, ConnectionGWName: Connections.ConnectionGWName },
            { ConnectionSMTPId: Connections.ConnectionSMTPId, ConnectionSMTPName: Connections.ConnectionSMTPName },
        ],
    };
}

function fromApiFormat(raw: any): Tenant {
    const conns = raw.Connections || [];
    const src  = conns.find((c: any) => c.ConnectionSourceId !== undefined) || {};
    const tgt  = conns.find((c: any) => c.ConnectionTargetId !== undefined) || {};
    const gw   = conns.find((c: any) => c.ConnectionGWId !== undefined) || {};
    const smtp = conns.find((c: any) => c.ConnectionSMTPId !== undefined) || {};
    return {
        id: raw.id || raw.id,
        TenantName: raw.TenantName || "",
        FinDimSet: raw.FinDimSet || 0,
        Description: raw.Description || "",
        IsDeleted: raw.IsDeleted || false,
        DBUser: (raw.DBUser || []).map((u: any) => ({ Login: u.Login || "", Password: u.Password || "" })),
        Connections: {
            ConnectionSourceId: src.ConnectionSourceId || "",
            ConnectionSourceName: src.ConnectionSourceName || "SAP B1 Connection",
            ConnectionTargetId: tgt.ConnectionTargetId || "",
            ConnectionTargetName: tgt.ConnectionTargetName || "Yooz",
            ConnectionGWId: gw.ConnectionGWId || "",
            ConnectionGWName: gw.ConnectionGWName || "SAP B1 Gateway",
            ConnectionSMTPId: smtp.ConnectionSMTPId || "",
            ConnectionSMTPName: smtp.ConnectionSMTPName || "SMTP",
        },
        Organizations: (raw.Organizations || []).map((org: any) => {
            const rawOT: Record<string, any> = org.ObjectType || {};
            const ObjectType: OrgObjectType = {};
            for (const [key, val] of Object.entries(rawOT)) {
                if (val && typeof val === "object") {
                    ObjectType[key] = {
                        Create: (val as any).Create ?? false,
                        ...((val as any).Update !== undefined ? { Update: (val as any).Update } : {}),
                    };
                }
            }
            return {
                OrganizationUnitId: org.OrganizationUnitId || "",
                ReferentialId: org.ReferentialId || "",
                Referentials: {
                    Suppliers: org.Referentials?.Suppliers || "YZ_SUPPLIER",
                    Customers: org.Referentials?.Customers || "YZ_CUSTOMER",
                    Accounts: org.Referentials?.Accounts || "YZ_ACCOUNT",
                },
                ExportDocumentItemCode: org.ExportDocumentItemCode || "YZ_IBS_SAPB1",
                ExportDocumentServiceCode: org.ExportDocumentServiceCode || "YZ_GENERIC_V2",
                Active: org.Active ?? true,
                ObjectType,
            };
        }),
    };
}

// ════════════════════════════════════════════════════════════════════════════
// Sub-components
// ════════════════════════════════════════════════════════════════════════════

function ObjTypeRow({ label, hasUpdate, value, onChange }: {
    label: string; hasUpdate: boolean; value: ObjectTypeItem; onChange: (v: ObjectTypeItem) => void;
}) {
    return (
        <div className="flex items-center gap-4 py-1">
            <span className="w-44 text-sm text-muted-foreground">{label}</span>
            <div className="flex items-center gap-1">
                <Switch checked={value.Create} onCheckedChange={c => onChange({ ...value, Create: c })} />
                <span className="text-xs w-10">Create</span>
            </div>
            {hasUpdate && (
                <div className="flex items-center gap-1">
                    <Switch checked={value.Update ?? false} onCheckedChange={u => onChange({ ...value, Update: u })} />
                    <span className="text-xs w-10">Update</span>
                </div>
            )}
        </div>
    );
}


// ════════════════════════════════════════════════════════════════════════════
// Main Page
// ════════════════════════════════════════════════════════════════════════════

export default function TenantConfig() {
    const  isAdmin  = true;

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
    // STATE — sheet / form
    // ============================================
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editMode, setEditMode]   = useState(false);
    const [saving, setSaving]       = useState(false);
    const [form, setForm]           = useState<Tenant>(makeDefaultTenant([]));

    // ============================================
    // STATE — selection & confirmation
    // ============================================
    const [selected, setSelected]       = useState<Set<string>>(new Set());
    const [archiveId, setArchiveId]     = useState<string | null>(null);
    const [deleteId, setDeleteId]       = useState<string | null>(null);
    const [bulkConfirm, setBulkConfirm] = useState<BulkAction | null>(null);
    const [bulkBusy, setBulkBusy]       = useState(false);

    // ============================================
    // HOOKS
    // ============================================
    const {
        tenants,
        loadingTenants,
        paginationTenants,
        fetchTenants,
        createTenant,
        updateTenant,
        archiveTenant,
        unarchiveTenant,
        deleteTenantById,
        rawConfigs,
        fetchObjectConfigs,
    } = useTenant();

    const {
        snackbar,
        snackbarSuccess,
        snackbarError,
        hideSnackbar,
    } = useSnackbar();


    const configuredTypes = useMemo<ConfiguredType[]>(() => {
        const map = new Map<string, { hasCreate: boolean; hasUpdate: boolean }>();
        for (const cfg of rawConfigs || []) {
            const entry = map.get(cfg.ObjectType) ?? { hasCreate: false, hasUpdate: false };
            if (cfg.Transaction === "CREATE") entry.hasCreate = true;
            if (cfg.Transaction === "UPDATE") entry.hasUpdate = true;
            map.set(cfg.ObjectType, entry);
        }
        return Array.from(map.entries()).map(([name, ops]) => ({ name, ...ops }));
    }, [rawConfigs]);

    const enrichOrg = (org: Organization): Organization => {
        const merged: OrgObjectType = { ...org.ObjectType };
        for (const ct of configuredTypes) {
            if (!(ct.name in merged)) {
                merged[ct.name] = { Create: false, ...(ct.hasUpdate ? { Update: false } : {}) };
            }
        }
        return { ...org, ObjectType: merged };
    };

    // ============================================
    // EFFECTS
    // ============================================
    useEffect(() => {
        fetchTenants(filters);
    }, [filters, fetchTenants]);

    useEffect(() => {
        fetchObjectConfigs();
    }, [fetchObjectConfigs]);

    // ============================================
    // DERIVED VALUES
    // ============================================
    const totalPages = Math.ceil(paginationTenants.TotalCount / filters.PageSize);

    const active   = tenants.filter((t: any) => !t.IsDeleted);
    const archived = tenants.filter((t: any) =>  t.IsDeleted);
    const selCount = selected.size;
    console.log("selCount",selCount)
    const selectedHasActive   = Array.from(selected).some(id => tenants.find((t: any) => t.id === id && !t.IsDeleted));
    const selectedHasArchived = Array.from(selected).some(id => tenants.find((t: any) => t.id === id &&  t.IsDeleted));

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
        fetchTenants(filters);
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({
            ...prev,
            PageNumber: newPage,
        }));
    };

    // ============================================
    // HANDLERS — selection
    // ============================================
    const toggleSelect = (id: string, checked: boolean) =>
        setSelected(prev => { const s = new Set(prev); checked ? s.add(id) : s.delete(id); return s; });

    const selectAll = (items: any[]) => setSelected(new Set(items.map(t => t.id)));

    const deselectGroup = (items: any[]) =>
        setSelected(prev => { const s = new Set(prev); items.forEach(t => s.delete(t.id)); return s; });

    const clearSelection = () => setSelected(new Set());

    // ============================================
    // HANDLERS — create / update
    // ============================================
    const handleSave = async () => {
        setSaving(true);
        try {
            const body = toApiFormat(form);
            const res = editMode && form.id
                ? await updateTenant(form.id, body)
                : await createTenant(body);

            if (res) {
                snackbarSuccess(editMode ? "Tenant Updated" : "Tenant Created");
                setSheetOpen(false);
                await fetchTenants(filters);
            } else {
                snackbarError("Failed to save tenant. Please try again");
            }
        } catch (err) {
            snackbarError("Failed to save tenant. Please try again");
        } finally {
            setSaving(false);
        }
    };

    const openEdit = (raw: any) => {
        const parsed = fromApiFormat(raw);
        setForm({ ...parsed, Organizations: parsed.Organizations.map(enrichOrg) });
        setEditMode(true);
        setSheetOpen(true);
    };

    const openCreate = () => {
        setForm(makeDefaultTenant(configuredTypes));
        setEditMode(false);
        setSheetOpen(true);
    };

    // ============================================
    // HANDLERS — archive / unarchive / delete
    // ============================================
    const confirmArchive = async () => {
        if (!archiveId) return;
        try {
            const res = await archiveTenant(archiveId);
            if (res) {
                snackbarSuccess("The tenant has been archived.");
                setSelected(new Set());
                await fetchTenants(filters);
            } else {
                snackbarError("Failed to archive tenant. Please try again");
            }
        } catch (err) {
            snackbarError("Failed to archive tenant. Please try again");
        } finally {
            setArchiveId(null);
        }
    };

    const handleUnarchive = async (id: string) => {
        try {
            const res = await unarchiveTenant(id);
            if (res) {
                snackbarSuccess("The tenant has been restored.");
                setSelected(new Set());
                await fetchTenants(filters);
            } else {
                snackbarError("Failed to restore tenant. Please try again");
            }
        } catch (err) {
            snackbarError("Failed to restore tenant. Please try again");
        }
    };

    const confirmDeleteForever = async () => {
        if (!deleteId) return;
        try {
            const res = await deleteTenantById(deleteId);
            if (res) {
                snackbarSuccess("Tenant Permanently Deleted");
                setSelected(new Set());
                await fetchTenants(filters);
            } else {
                snackbarError( "Failed to delete tenant. Please try again");
            }
        } catch (err) {
            snackbarError( "Failed to delete tenant. Please try again");
        } finally {
            setDeleteId(null);
        }
    };

    // ============================================
    // HANDLERS — bulk actions
    // ============================================
    const confirmBulk = async () => {
        if (!bulkConfirm) return;
        setBulkBusy(true);
        try {
            const ids = Array.from(selected);

            if (bulkConfirm === "archive") {
                await Promise.all(ids.map(id => archiveTenant(id)));
            } else if (bulkConfirm === "unarchive") {
                await Promise.all(ids.map(id => unarchiveTenant(id)));
            } else if (bulkConfirm === "delete") {
                await Promise.all(ids.map(id => deleteTenantById(id)));
            }

            const label = bulkConfirm === "archive" ? "Archived" : bulkConfirm === "unarchive" ? "Restored" : "Permanently Deleted";
            snackbarSuccess(`${selCount} tenant(s) ${label}`);
            setSelected(new Set());
            await fetchTenants(filters);
        } catch (err) {
            snackbarError("Bulk action failed. Please try again");
        } finally {
            setBulkBusy(false);
            setBulkConfirm(null);
        }
    };

    // ============================================
    // HANDLERS — form fields (Organizations)
    // ============================================
    const updateOrg = (idx: number, patch: Partial<Organization>) => {
        setForm(f => {
            const orgs = [...f.Organizations];
            orgs[idx] = { ...orgs[idx], ...patch };
            return { ...f, Organizations: orgs };
        });
    };

    const updateObjType = (orgIdx: number, key: string, val: ObjectTypeItem) => {
        setForm(f => {
            const orgs = [...f.Organizations];
            orgs[orgIdx] = { ...orgs[orgIdx], ObjectType: { ...orgs[orgIdx].ObjectType, [key]: val } };
            return { ...f, Organizations: orgs };
        });
    };

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                <ShieldOff className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Access Denied</h2>
                <p className="text-muted-foreground max-w-sm">Only administrators can manage tenant configuration.</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8">

        <div className="space-y-6">

            {/* ── Header ──────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-semibold">Tenants</h1>
                    <p className="text-sm text-muted-foreground mt-1">YOOZ_B1_INTEGRATION.Tenants</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={loadingTenants}
                        className="p-2.5 text-muted-foreground hover:text-primary hover:bg-accent rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover-elevate"
                        title="Refresh"
                    >
                        <RefreshCw className={`h-4 w-4 ${loadingTenants ? "animate-spin" : ""}`} />
                    </button>
                    <Button onClick={openCreate}>
                        <Plus className="h-4 w-4 mr-2" /> New Tenant
                    </Button>
                </div>
            </div>

            {/* ── Search Bar ──────────────────────────────────────────────────── */}
            <SearchBar
                value={searchValue}
                onSearch={handleSearch}
                placeholder="Search name, description, organization unit ID..."
            />

            {/* ── Bulk Action Bar ──────────────────────────────────────────────── */}
            {selCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-muted/50 flex-wrap">
                    <span className="text-sm font-medium mr-1">{selCount} selected</span>
                    {selectedHasActive && (
                        <Button size="sm" variant="outline" className="text-amber-600 border-amber-400"
                                onClick={() => setBulkConfirm("archive")} disabled={bulkBusy}>
                            <Archive className="h-3.5 w-3.5 mr-1" />Archive Selected
                        </Button>
                    )}
                    {selectedHasArchived && (
                        <Button size="sm" variant="outline" className="text-green-600 border-green-400"
                                onClick={() => setBulkConfirm("unarchive")} disabled={bulkBusy}>
                            <ArchiveRestore className="h-3.5 w-3.5 mr-1" />Restore Selected
                        </Button>
                    )}
                    {selectedHasArchived && (
                        <Button size="sm" variant="outline" className="text-destructive border-destructive/40"
                                onClick={() => setBulkConfirm("delete")} disabled={bulkBusy}>
                            <Trash2 className="h-3.5 w-3.5 mr-1" />Delete Selected
                        </Button>
                    )}
                    <Button size="sm" variant="ghost" className="ml-auto" onClick={clearSelection}>
                        Clear
                    </Button>
                </div>
            )}

            {/* ── Cards ───────────────────────────────────────────────────────── */}
            {loadingTenants ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : tenants.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    {searchValue ? (
                        <>
                            <Search className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">No tenants match your search</p>
                            <Button variant="link" onClick={() => handleSearch("")} className="mt-2">Clear search</Button>
                        </>
                    ) : (
                        <>
                            <Building2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">No tenants found in database</p>
                        </>
                    )}
                </div>
            ) : (
                <div className="space-y-6">

                    {/* Active */}
                    {active.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    checked={active.length > 0 && active.every((t: any) => selected.has(t.id))}
                                    onCheckedChange={v => v ? selectAll(active) : deselectGroup(active)}
                                    aria-label="Select all active"
                                />
                                <span className="text-xs text-muted-foreground font-medium">Active ({active.length})</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {active.map((t: any) => (
                                    <TenantCard
                                        key={t.id}
                                        t={t}
                                        isArchived={false}
                                        selected={selected.has(t.id)}
                                        onSelect={toggleSelect}
                                        onEdit={openEdit}
                                        onArchive={id => setArchiveId(id)}
                                        onUnarchive={handleUnarchive}
                                        onDeleteForever={id => setDeleteId(id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Archived */}
                    {archived.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    checked={archived.length > 0 && archived.every((t: any) => selected.has(t.id))}
                                    onCheckedChange={v => v ? selectAll(archived) : deselectGroup(archived)}
                                    aria-label="Select all archived"
                                />
                                <span className="text-xs text-muted-foreground font-medium">Archived ({archived.length})</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {archived.map((t: any) => (
                                    <TenantCard
                                        key={t.id}
                                        t={t}
                                        isArchived
                                        selected={selected.has(t.id)}
                                        onSelect={toggleSelect}
                                        onEdit={openEdit}
                                        onArchive={() => {}}
                                        onUnarchive={handleUnarchive}
                                        onDeleteForever={id => setDeleteId(id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    <Pagination
                        currentPage={filters.PageNumber}
                        totalItems={paginationTenants.TotalCount}
                        pageSize={filters.PageSize}
                        totalPages={totalPages}
                        loading={loadingTenants}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            {/* ── Create / Edit Sheet ──────────────────────────────────────────── */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
                    <SheetHeader className="px-6 pt-6 pb-4 border-b">
                        <SheetTitle>{editMode ? `Edit — ${form.TenantName}` : "New Tenant"}</SheetTitle>
                        <SheetDescription>YOOZ_B1_INTEGRATION.Tenants</SheetDescription>
                    </SheetHeader>

                    <ScrollArea className="flex-1 px-6 py-4">
                        <Accordion type="multiple" defaultValue={["basic", "connections", "dbusers", "orgs"]} className="space-y-2">

                            {/* Basic Info */}
                            <AccordionItem value="basic" className="border rounded-lg px-4">
                                <AccordionTrigger className="text-sm font-semibold">
                                    <span className="flex items-center gap-2"><ServerCog className="h-4 w-4" />Basic Information</span>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2 pb-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label>Tenant Name</Label>
                                            <Input value={form.TenantName} onChange={e => setForm(f => ({ ...f, TenantName: e.target.value }))} placeholder="e.g. BIOLINE" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>FinDimSet</Label>
                                            <Input type="number" value={form.FinDimSet} onChange={e => setForm(f => ({ ...f, FinDimSet: parseInt(e.target.value) || 0 }))} />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Description</Label>
                                        <Input value={form.Description} onChange={e => setForm(f => ({ ...f, Description: e.target.value }))} placeholder="Yooz Database Configuration" />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Switch checked={form.IsDeleted} onCheckedChange={v => setForm(f => ({ ...f, IsDeleted: v }))} />
                                        <Label>Mark as Archived</Label>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Connections */}
                            <AccordionItem value="connections" className="border rounded-lg px-4">
                                <AccordionTrigger className="text-sm font-semibold">
                                    <span className="flex items-center gap-2"><Database className="h-4 w-4" />Connections</span>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2 pb-4">
                                    {[
                                        { label: "SAP B1 Source",  idKey: "ConnectionSourceId", nameKey: "ConnectionSourceName" },
                                        { label: "Yooz Target",    idKey: "ConnectionTargetId", nameKey: "ConnectionTargetName" },
                                        { label: "SAP B1 Gateway", idKey: "ConnectionGWId",     nameKey: "ConnectionGWName" },
                                        { label: "SMTP",           idKey: "ConnectionSMTPId",   nameKey: "ConnectionSMTPName" },
                                    ].map(({ label, idKey, nameKey }) => (
                                        <div key={idKey} className="rounded-md border p-3 space-y-3">
                                            <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs">Connection ID</Label>
                                                    <Input
                                                        value={(form.Connections as any)[idKey]}
                                                        onChange={e => setForm(f => ({ ...f, Connections: { ...f.Connections, [idKey]: e.target.value } }))}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs">Display Name</Label>
                                                    <Input
                                                        value={(form.Connections as any)[nameKey]}
                                                        onChange={e => setForm(f => ({ ...f, Connections: { ...f.Connections, [nameKey]: e.target.value } }))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>

                            {/* DB Users */}
                            <AccordionItem value="dbusers" className="border rounded-lg px-4">
                                <AccordionTrigger className="text-sm font-semibold">
                                    <span className="flex items-center gap-2"><Users className="h-4 w-4" />DB Users</span>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-3 pt-2 pb-4">
                                    {form.DBUser.map((u, i) => (
                                        <div key={i} className="flex gap-2 items-end">
                                            <div className="space-y-1.5 flex-1">
                                                <Label className="text-xs">Login</Label>
                                                <Input
                                                    value={u.Login}
                                                    onChange={e => {
                                                        const users = [...form.DBUser];
                                                        users[i] = { ...users[i], Login: e.target.value };
                                                        setForm(f => ({ ...f, DBUser: users }));
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-1.5 flex-1">
                                                <Label className="text-xs">Password</Label>
                                                <Input
                                                    type="password"
                                                    value={u.Password}
                                                    onChange={e => {
                                                        const users = [...form.DBUser];
                                                        users[i] = { ...users[i], Password: e.target.value };
                                                        setForm(f => ({ ...f, DBUser: users }));
                                                    }}
                                                />
                                            </div>
                                            {form.DBUser.length > 1 && (
                                                <Button
                                                    size="icon" variant="ghost" className="text-destructive shrink-0"
                                                    onClick={() => setForm(f => ({ ...f, DBUser: f.DBUser.filter((_, j) => j !== i) }))}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    <Button size="sm" variant="outline" onClick={() => setForm(f => ({ ...f, DBUser: [...f.DBUser, { Login: "", Password: "" }] }))}>
                                        <Plus className="h-3.5 w-3.5 mr-1" />Add DB User
                                    </Button>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Organizations */}
                            <AccordionItem value="orgs" className="border rounded-lg px-4">
                                <AccordionTrigger className="text-sm font-semibold">
                                    <span className="flex items-center gap-2"><Building2 className="h-4 w-4" />Organizations ({form.Organizations.length})</span>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2 pb-4">
                                    {form.Organizations.map((org, oi) => (
                                        <div key={oi} className="border rounded-lg p-4 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-sm">{org.OrganizationUnitId || `Organization ${oi + 1}`}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <Switch checked={org.Active} onCheckedChange={v => updateOrg(oi, { Active: v })} />
                                                        <span className="text-xs">{org.Active ? "Active" : "Inactive"}</span>
                                                    </div>
                                                    {form.Organizations.length > 1 && (
                                                        <Button
                                                            size="icon" variant="ghost" className="h-7 w-7 text-destructive"
                                                            onClick={() => setForm(f => ({ ...f, Organizations: f.Organizations.filter((_, j) => j !== oi) }))}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs">Organization Unit ID</Label>
                                                    <Input value={org.OrganizationUnitId} onChange={e => updateOrg(oi, { OrganizationUnitId: e.target.value })} placeholder="e.g. BI19" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs">Referential ID</Label>
                                                    <Input value={org.ReferentialId} onChange={e => updateOrg(oi, { ReferentialId: e.target.value })} placeholder="e.g. SIEGE" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs">Export Document Item Code</Label>
                                                    <Input value={org.ExportDocumentItemCode} onChange={e => updateOrg(oi, { ExportDocumentItemCode: e.target.value })} />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs">Export Document Service Code</Label>
                                                    <Input value={org.ExportDocumentServiceCode} onChange={e => updateOrg(oi, { ExportDocumentServiceCode: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-xs font-semibold uppercase text-muted-foreground">Referentials</p>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {(["Suppliers", "Customers", "Accounts"] as const).map(ref => (
                                                        <div key={ref} className="space-y-1">
                                                            <Label className="text-xs">{ref}</Label>
                                                            <Input value={org.Referentials[ref]} onChange={e => updateOrg(oi, { Referentials: { ...org.Referentials, [ref]: e.target.value } })} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            {configuredTypes.length > 0 && (
                                                <div className="space-y-1">
                                                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Object Types</p>
                                                    {configuredTypes.map(ct => (
                                                        <ObjTypeRow
                                                            key={ct.name}
                                                            label={ct.name}
                                                            hasUpdate={ct.hasUpdate}
                                                            value={org.ObjectType[ct.name] ?? { Create: false }}
                                                            onChange={v => updateObjType(oi, ct.name, v)}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <Button size="sm" variant="outline" onClick={() => setForm(f => ({ ...f, Organizations: [...f.Organizations, makeDefaultOrg(configuredTypes)] }))}>
                                        <Plus className="h-3.5 w-3.5 mr-1" />Add Organization
                                    </Button>
                                </AccordionContent>
                            </AccordionItem>

                        </Accordion>
                    </ScrollArea>

                    <div className="px-6 py-4 border-t flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving || !form.TenantName}>
                            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {editMode ? "Save Changes" : "Create Tenant"}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* ── Archive confirmation ─────────────────────────────────────────── */}
            <AlertDialog open={!!archiveId} onOpenChange={open => !open && setArchiveId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archive Tenant?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will mark the tenant as archived (IsDeleted: true). The record is kept in MongoDB and can be restored at any time.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-amber-600 text-white hover:bg-amber-700"
                            onClick={confirmArchive}
                        >
                            Archive
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Delete forever confirmation ──────────────────────────────────── */}
            <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Permanently?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove this tenant from MongoDB. <strong>This cannot be undone.</strong>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={confirmDeleteForever}
                        >
                            Delete Forever
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Bulk confirmation ────────────────────────────────────────────── */}
            <AlertDialog open={!!bulkConfirm} onOpenChange={open => !open && setBulkConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {bulkConfirm === "archive"   ? `Archive ${selCount} tenant(s)?` :
                                bulkConfirm === "unarchive" ? `Restore ${selCount} tenant(s)?` :
                                    `Delete ${selCount} tenant(s) forever?`}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {bulkConfirm === "delete"
                                ? "This will permanently remove all selected tenants from MongoDB. This cannot be undone."
                                : bulkConfirm === "archive"
                                    ? "All selected tenants will be marked as archived."
                                    : "All selected tenants will be restored to active."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className={
                                bulkConfirm === "delete"  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" :
                                    bulkConfirm === "archive" ? "bg-amber-600 text-white hover:bg-amber-700" : ""
                            }
                            disabled={bulkBusy}
                            onClick={confirmBulk}
                        >
                            {bulkBusy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {bulkConfirm === "archive" ? "Archive" : bulkConfirm === "unarchive" ? "Restore" : "Delete Forever"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
        </div>
    );
}