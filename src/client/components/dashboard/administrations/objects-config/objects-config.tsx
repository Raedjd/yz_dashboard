'use client';

import { useEffect, useState } from "react";
import {
    Braces,
    ChevronDown,
    ChevronRight,
    Loader2,
    Plus,
    RefreshCw,
    Settings2,
    ShieldOff,
    Trash2,
    Type,
    X,
    Archive,
    ArchiveRestore,
    AlertTriangle,
    Database,
    Target,
    Cog,
    SlidersHorizontal,
    ArrowUpDown,
    ArrowUp,
    ArrowDown, Search,
} from "lucide-react";

import Pagination from "@client/shared/components/Pagination";
import DeleteDialog from "@client/shared/components/DeleteDialog";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@client/shared/components/ui/alert-dialog";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@client/shared/components/ui/sheet";
import { ScrollArea } from "@client/shared/components/ui/scroll-area";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@client/shared/components/ui/accordion";
import { Badge } from "@client/shared/components/ui/badge";
import { Checkbox } from "@client/shared/components/ui/checkbox";
import { Button } from "@client/shared/components/ui/button";
import { Label } from "@client/shared/components/ui/label";
import { Input } from "@client/shared/components/ui/input";
import SearchBar from "@client/shared/components/SearchBar";
import { useSnackbar } from "@client/shared/hooks/useSnackbar";
import Snackbar from "@client/shared/components/Snackbar";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@client/shared/components/ui/select";
import { useObjectConfig } from "@client/hooks/useObjectConfigHook";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@client/shared/components/ui/dropdown-menu";
import { ObjectConfigCard } from "@client/components/dashboard/administrations/objects-config/ObjectConfigCard";
import { ObjectConfig } from "@/client/types/objectConfig";

// ════════════════════════════════════════════════════════════════════════════
// Types & constants
// ════════════════════════════════════════════════════════════════════════════

interface FieldEntry { label: string; techName: string; }

interface AdditionalEntry {
    key: string;
    kind: "string" | "object";
    value: string;
    children: FieldEntry[];
}

const KNOWN_OP_KEYS = new Set([
    "type",
    "method",
    "source_endpoint",
    "source_endpoint_configuration",
    "target_endpoint",
    "update_externalId_endpoint",
    "organization_identifier_key",
]);

interface ConfigState {
    source_name: string;
    source_fields: FieldEntry[];
    target_name: string;
    target_fields: FieldEntry[];
    op_method: string;
    op_source_endpoint: string;
    op_filter: string;
    op_select: string;
    op_orderby: string;
    op_target_endpoint: string;
    op_update_externalId_endpoint: string;
    op_organization_identifier_key: string;
    op_additional_config: AdditionalEntry[];
}

interface DocState {
    id?: string;
    DocumentType: string;
    ObjectType: string;
    Transaction: string;
    IsDeleted?: boolean;
}

type SortField = "ObjectType" | "DocumentType" | "Transaction" | "CreatedAt";
type SortOrder = "asc" | "desc";

// Content shown by the archive/unarchive confirmation dialog (AlertDialog),
// with the actual action to run baked in — no switch/case needed.
interface ArchiveConfirmState {
    title: string;
    description: string;
    confirmLabel: string;
    confirmClassName: string;
    run: () => void;
}

// Content shown by the delete confirmation dialog (your DeleteDialog).
interface DeleteConfirmState {
    title: string;
    message: string;
    run: () => void;
}

const OBJECT_TYPES = [
    "PurchaseDeliveryNotes", "Invoices", "Suppliers", "Customers", "Accounts",
    "Analytical", "Payments", "DocumentItems", "DocumentServices",
];

// ════════════════════════════════════════════════════════════════════════════
// Config helpers (unchanged logic — pure functions, no API/state concerns)
// ════════════════════════════════════════════════════════════════════════════

function defaultConfig(): ConfigState {
    return {
        source_name: "B1",
        source_fields: [
            { label: "external_id_update_field", techName: "U_IBS_EXTERNAL_ID_YOOZ" },
            { label: "sync_status_field", techName: "U_IBS_SYNC_STATUS_YOOZ" },
            { label: "id", techName: "DocEntry" },
        ],
        target_name: "Yooz",
        target_fields: [
            { label: "id", techName: "" },
            { label: "name", techName: "" },
        ],
        op_method: "POST",
        op_source_endpoint: "",
        op_filter: "", op_select: "", op_orderby: "",
        op_target_endpoint: "",
        op_update_externalId_endpoint: "",
        op_organization_identifier_key: "OrganizationUnitId",
        op_additional_config: [],
    };
}

function parseConfig(raw: any): ConfigState {
    const src = raw?.source || {};
    const tgt = raw?.target || {};
    const op = raw?.operation || {};
    const sec = op?.source_endpoint_configuration || {};

    const toEntries = (obj: any): FieldEntry[] => {
        const e = Object.entries(obj || {}).map(([label, techName]) => ({ label, techName: String(techName) }));
        return e.length ? e : [{ label: "", techName: "" }];
    };

    const additionalConfig: AdditionalEntry[] = Object.entries(op)
        .filter(([key]) => !KNOWN_OP_KEYS.has(key))
        .map(([key, val]): AdditionalEntry => {
            if (val !== null && typeof val === "object" && !Array.isArray(val)) {
                const children: FieldEntry[] = Object.entries(val as Record<string, unknown>).map(
                    ([k, v]) => ({ label: k, techName: String(v) })
                );
                return {
                    key,
                    kind: "object",
                    value: "",
                    children: children.length ? children : [{ label: "", techName: "" }],
                };
            }
            return { key, kind: "string", value: String(val ?? ""), children: [] };
        });

    return {
        source_name: src.source_name || "",
        source_fields: toEntries(src.fields),
        target_name: tgt.target_name || "",
        target_fields: toEntries(tgt.fields),
        op_method: op.method || "POST",
        op_source_endpoint: op.source_endpoint || "",
        op_filter: sec.filter || "", op_select: sec.select || "", op_orderby: sec.orderby || "",
        op_target_endpoint: op.target_endpoint || "",
        op_update_externalId_endpoint: op.update_externalId_endpoint || "",
        op_organization_identifier_key: op.organization_identifier_key || "OrganizationUnitId",
        op_additional_config: additionalConfig,
    };
}

function buildConfig(cfg: ConfigState, transaction: string): object {
    const toObj = (fields: FieldEntry[]) =>
        Object.fromEntries(fields.filter(f => f.label).map(f => [f.label, f.techName]));

    const additionalObj: Record<string, any> = {};
    for (const entry of cfg.op_additional_config) {
        if (!entry.key.trim()) continue;
        additionalObj[entry.key.trim()] =
            entry.kind === "object" ? toObj(entry.children) : entry.value;
    }

    return {
        source: { source_name: cfg.source_name, fields: toObj(cfg.source_fields) },
        target: { target_name: cfg.target_name, fields: toObj(cfg.target_fields) },
        operation: {
            type: transaction,
            method: cfg.op_method,
            source_endpoint: cfg.op_source_endpoint,
            source_endpoint_configuration: { filter: cfg.op_filter, select: cfg.op_select, orderby: cfg.op_orderby },
            target_endpoint: cfg.op_target_endpoint,
            update_externalId_endpoint: cfg.op_update_externalId_endpoint,
            organization_identifier_key: cfg.op_organization_identifier_key,
            ...additionalObj,
        },
    };
}

// ════════════════════════════════════════════════════════════════════════════
// FieldsEditor
// ════════════════════════════════════════════════════════════════════════════

function FieldsEditor({ fields, onChange }: { fields: FieldEntry[]; onChange: (f: FieldEntry[]) => void }) {
    const update = (i: number, patch: Partial<FieldEntry>) => {
        const next = [...fields]; next[i] = { ...next[i], ...patch }; onChange(next);
    };
    return (
        <div className="space-y-2">
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs font-medium text-muted-foreground px-1">
                <span>Label</span><span>Technical field name</span><span />
            </div>
            {fields.map((f, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                    <Input value={f.label} placeholder="e.g. id" onChange={e => update(i, { label: e.target.value })} />
                    <Input value={f.techName} placeholder="e.g. DocEntry" onChange={e => update(i, { techName: e.target.value })} />
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => onChange(fields.filter((_, j) => j !== i))} disabled={fields.length === 1}>
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            ))}
            <Button size="sm" variant="outline" onClick={() => onChange([...fields, { label: "", techName: "" }])} className="mt-1">
                <Plus className="h-3.5 w-3.5 mr-1" />Add Field
            </Button>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// AddEntryButtons (shared footer)
// ════════════════════════════════════════════════════════════════════════════

function AddEntryButtons({ onAdd }: { onAdd: (kind: "string" | "object") => void }) {
    return (
        <div className="flex items-center gap-2 pt-1">
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onAdd("string")}>
                <Type className="h-3 w-3 mr-1" />Add String Field
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onAdd("object")}>
                <Braces className="h-3 w-3 mr-1" />Add Object Group
            </Button>
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// AdditionalConfigEditor
// ════════════════════════════════════════════════════════════════════════════

function AdditionalConfigEditor({
                                    entries,
                                    onChange,
                                }: {
    entries: AdditionalEntry[];
    onChange: (e: AdditionalEntry[]) => void;
}) {
    const [expanded, setExpanded] = useState<Set<number>>(new Set());

    const updateEntry = (i: number, patch: Partial<AdditionalEntry>) => {
        const next = [...entries]; next[i] = { ...next[i], ...patch }; onChange(next);
    };

    const removeEntry = (i: number) => {
        onChange(entries.filter((_, j) => j !== i));
        setExpanded(prev => {
            const shifted = new Set<number>();
            prev.forEach(idx => { if (idx < i) shifted.add(idx); else if (idx > i) shifted.add(idx - 1); });
            return shifted;
        });
    };

    const toggleExpand = (i: number) =>
        setExpanded(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });

    const addEntry = (kind: "string" | "object") => {
        const newEntry: AdditionalEntry = kind === "string"
            ? { key: "", kind: "string", value: "", children: [] }
            : { key: "", kind: "object", value: "", children: [{ label: "", techName: "" }] };
        const next = [...entries, newEntry];
        onChange(next);
        if (kind === "object") setExpanded(prev => new Set(prev).add(next.length - 1));
    };

    const changeKind = (i: number, kind: "string" | "object") => {
        if (kind === "object") {
            updateEntry(i, { kind: "object", value: "", children: [{ label: "", techName: "" }] });
            setExpanded(prev => new Set(prev).add(i));
        } else {
            updateEntry(i, { kind: "string", value: "", children: [] });
            setExpanded(prev => { const s = new Set(prev); s.delete(i); return s; });
        }
    };

    const updateChild = (ei: number, ci: number, patch: Partial<FieldEntry>) => {
        const children = [...entries[ei].children];
        children[ci] = { ...children[ci], ...patch };
        updateEntry(ei, { children });
    };

    const addChild = (ei: number) =>
        updateEntry(ei, { children: [...entries[ei].children, { label: "", techName: "" }] });

    const removeChild = (ei: number, ci: number) => {
        const entry = entries[ei];
        if (entry.children.length === 1) return;
        updateEntry(ei, { children: entry.children.filter((_, j) => j !== ci) });
    };

    if (entries.length === 0) {
        return (
            <div className="space-y-3">
                <p className="text-xs text-muted-foreground italic px-1">
                    No additional config yet. Add a <strong>string</strong> or an <strong>object</strong> group
                    (e.g. <code className="bg-muted rounded px-1 font-mono">additional_endpoints</code>).
                </p>
                <AddEntryButtons onAdd={addEntry} />
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {entries.map((entry, i) => {
                const isOpen = expanded.has(i);
                const objectSummary = entry.kind === "object"
                    ? entry.children.filter(c => c.label).map(c => c.label).join(", ")
                    : "";

                return (
                    <div key={i} className="rounded-md border bg-background overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-2 bg-muted/30">
                            <Select value={entry.kind} onValueChange={v => changeKind(i, v as "string" | "object")}>
                                <SelectTrigger className="h-7 w-[95px] text-xs font-mono shrink-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="string">
                                        <span className="flex items-center gap-1.5 text-xs"><Type className="h-3 w-3" />string</span>
                                    </SelectItem>
                                    <SelectItem value="object">
                                        <span className="flex items-center gap-1.5 text-xs"><Braces className="h-3 w-3" />object</span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Input
                                value={entry.key}
                                placeholder="field key"
                                onChange={e => updateEntry(i, { key: e.target.value })}
                                className="h-7 text-xs font-mono flex-1 min-w-0"
                            />

                            {entry.kind === "object" && (
                                <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-muted-foreground"
                                        onClick={() => toggleExpand(i)} title={isOpen ? "Collapse" : "Expand"}>
                                    {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                                </Button>
                            )}

                            <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                                    onClick={() => removeEntry(i)} title="Remove">
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>

                        {entry.kind === "string" && (
                            <div className="px-3 py-2">
                                <Input
                                    value={entry.value}
                                    placeholder="value"
                                    onChange={e => updateEntry(i, { value: e.target.value })}
                                    className="text-xs font-mono"
                                />
                            </div>
                        )}

                        {entry.kind === "object" && isOpen && (
                            <div className="px-3 py-3 space-y-2 border-t bg-muted/10">
                                <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs font-medium text-muted-foreground px-1">
                                    <span>Key</span><span>Value</span><span />
                                </div>
                                {entry.children.map((child, ci) => (
                                    <div key={ci} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                                        <Input
                                            value={child.label}
                                            placeholder="e.g. export_yooz_endpoint"
                                            onChange={e => updateChild(i, ci, { label: e.target.value })}
                                            className="text-xs font-mono h-8"
                                        />
                                        <Input
                                            value={child.techName}
                                            placeholder="value"
                                            onChange={e => updateChild(i, ci, { techName: e.target.value })}
                                            className="text-xs font-mono h-8"
                                        />
                                        <Button size="icon" variant="ghost"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => removeChild(i, ci)}
                                                disabled={entry.children.length === 1}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                                <Button size="sm" variant="outline" className="mt-1 h-7 text-xs" onClick={() => addChild(i)}>
                                    <Plus className="h-3 w-3 mr-1" />Add Sub-field
                                </Button>
                            </div>
                        )}

                        {entry.kind === "object" && !isOpen && (
                            <div
                                className="px-3 py-1.5 border-t cursor-pointer hover:bg-muted/20 transition-colors"
                                onClick={() => toggleExpand(i)}
                            >
                                <p className="text-xs text-muted-foreground font-mono">
                                    {objectSummary
                                        ? `{ ${objectSummary} }`
                                        : <span className="italic">empty object — click to expand</span>}
                                </p>
                            </div>
                        )}
                    </div>
                );
            })}

            <AddEntryButtons onAdd={addEntry} />
        </div>
    );
}

// ════════════════════════════════════════════════════════════════════════════
// Main Page
// ════════════════════════════════════════════════════════════════════════════

export default function ObjectsConfig() {
    const isAdmin = true;

    // ============================================
    // STATE — filters / pagination (drives the API call, no client-side
    // search/sort/filter anymore)
    // ============================================
    const [filters, setFilters] = useState({
        PageNumber: 0,
        PageSize: 9,
        Search: "",
        SortBy: "ObjectType" as SortField,
        SortOrder: "asc" as SortOrder,
    });
    const [searchValue, setSearchValue] = useState("");

    // ============================================
    // HOOKS
    // ============================================
    const {
        objectConfigs,
        loadingObjectConfigs,
        paginationObjectConfigs,
        fetchObjectConfigs,
        createObjectConfig,
        updateObjectConfig,
        deleteObjectConfigById,
        archiveObjectConfig,
        unarchiveObjectConfig,
    } = useObjectConfig();

    const { snackbar, snackbarSuccess, snackbarError, hideSnackbar } = useSnackbar();

    useEffect(() => {
        fetchObjectConfigs(filters);
    }, [filters, fetchObjectConfigs]);

    const totalPages = Math.ceil((paginationObjectConfigs?.TotalCount ?? 0) / filters.PageSize);

    // ============================================
    // STATE — Create/Edit sheet
    // ============================================
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [doc, setDoc] = useState<DocState>({
        DocumentType: "config",
        ObjectType: "PurchaseDeliveryNotes",
        Transaction: "CREATE",
    });
    const [cfg, setCfg] = useState<ConfigState>(defaultConfig());

    // ============================================
    // STATE — selection & confirmation
    // ============================================
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [archiveConfirm, setArchiveConfirm] = useState<ArchiveConfirmState | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null);
    const [confirmBusy, setConfirmBusy] = useState(false);

    // ============================================
    // Derived
    // ============================================
    const active = objectConfigs.filter((c: ObjectConfig) => !c.IsDeleted);
    const archived = objectConfigs.filter((c: ObjectConfig) => c.IsDeleted);
    const selCount = selected.size;
    const selectedHasActive = Array.from(selected).some(id => objectConfigs.find((c: ObjectConfig) => c.id === id && !c.IsDeleted));
    const selectedHasArchived = Array.from(selected).some(id => objectConfigs.find((c: ObjectConfig) => c.id === id && c.IsDeleted));
    const additionalCount = cfg.op_additional_config.filter(e => e.key.trim()).length;

    // Duplicate-key check is best-effort: it only looks at the currently
    // loaded page, since the full list now lives server-side.
    const isDuplicateKey = () =>
        objectConfigs.some((c: ObjectConfig) =>
            c.ObjectType === doc.ObjectType &&
            c.DocumentType === doc.DocumentType &&
            c.Transaction === doc.Transaction &&
            c.id !== doc.id &&
            !c.IsDeleted
        );

    // ============================================
    // HANDLERS — search / sort / pagination (all API-driven)
    // ============================================
    const handleSearch = (value: string) => {
        setSearchValue(value);
        setFilters(prev => ({ ...prev, Search: value, PageNumber: 0 }));
    };

    const handleRefresh = () => fetchObjectConfigs(filters);

    const handlePageChange = (newPage: number) =>
        setFilters(prev => ({ ...prev, PageNumber: newPage }));

    const toggleSort = (field: SortField) => {
        setFilters(prev => ({
            ...prev,
            SortBy: field,
            SortOrder: prev.SortBy === field && prev.SortOrder === "asc" ? "desc" : "asc",
            PageNumber: 0,
        }));
    };

    const getSortIcon = (field: SortField) => {
        if (filters.SortBy !== field) return <ArrowUpDown className="h-3.5 w-3.5" />;
        return filters.SortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />;
    };

    // ============================================
    // HANDLERS — selection
    // ============================================
    const toggleSelect = (id: string, checked: boolean) =>
        setSelected(prev => { const s = new Set(prev); checked ? s.add(id) : s.delete(id); return s; });
    const selectAll = (items: ObjectConfig[]) => setSelected(new Set(items.map(c => c.id)));
    const clearSelection = () => setSelected(new Set());

    // ObjectConfigCard may call onArchive/onUnarchive/onDeleteForever with
    // either the id string or the full config object depending on its
    // implementation — this normalizes both cases.
    const idOf = (arg: string | ObjectConfig): string | undefined =>
        typeof arg === "string" ? arg : arg?.id;

    // ============================================
    // HANDLERS — create / edit sheet
    // ============================================
    const openCreate = () => {
        setDoc({ DocumentType: "config", ObjectType: "PurchaseDeliveryNotes", Transaction: "CREATE" });
        setCfg(defaultConfig());
        setEditMode(false);
        setSheetOpen(true);
    };

    const openEdit = (raw: ObjectConfig) => {
        setDoc({
            id: raw.id,
            DocumentType: raw.DocumentType || "config",
            ObjectType: raw.ObjectType || "PurchaseDeliveryNotes",
            Transaction: raw.Transaction || "CREATE",
            IsDeleted: raw.IsDeleted,
        });
        setCfg(parseConfig((raw as any).Config));
        setEditMode(true);
        setSheetOpen(true);
    };

    const setTransaction = (t: string) => {
        setDoc(d => ({ ...d, Transaction: t }));
        if (t === "CREATE") setCfg(c => ({ ...c, op_method: "POST" }));
        else if (cfg.op_method === "POST") setCfg(c => ({ ...c, op_method: "PATCH" }));
    };

    const handleSave = async () => {
        if (isDuplicateKey()) {
            snackbarError(`A config with ObjectType="${doc.ObjectType}", DocumentType="${doc.DocumentType}", Transaction="${doc.Transaction}" already exists.`);
            return;
        }
        setSaving(true);
        try {
            const body = {
                DocumentType: doc.DocumentType,
                ObjectType: doc.ObjectType,
                Transaction: doc.Transaction,
                Config: buildConfig(cfg, doc.Transaction),
            };
            if (editMode && doc.id) {
                await updateObjectConfig(doc.id, body);
                snackbarSuccess("Config Updated");
            } else {
                await createObjectConfig(body);
                snackbarSuccess("Config Created");
            }
            setSheetOpen(false);
            await fetchObjectConfigs(filters);
        } catch (e: any) {
            snackbarError(e?.message || "Failed to save config");
        } finally {
            setSaving(false);
        }
    };

    // ============================================
    // HANDLERS — clone
    // ============================================
    const handleClone = async (raw: ObjectConfig) => {
        try {
            const { id, IsDeleted, CreatedAt, UpdatedAt, ...rest } = raw as any;
            let newObjectType = `${raw.ObjectType} (copy)`;
            let counter = 1;
            while (objectConfigs.some((c: ObjectConfig) =>
                c.ObjectType === newObjectType &&
                c.DocumentType === raw.DocumentType &&
                c.Transaction === raw.Transaction &&
                !c.IsDeleted
            )) {
                counter++; newObjectType = `${raw.ObjectType} (copy ${counter})`;
            }
            await createObjectConfig({ ...rest, ObjectType: newObjectType });
            snackbarSuccess("Config Cloned");
            await fetchObjectConfigs(filters);
        } catch (e: any) {
            snackbarError(e?.message || "Failed to clone config");
        }
    };

    // ============================================
    // HANDLERS — archive / unarchive (single item)
    // ============================================
    const handleArchive = async (id: string) => {
        setConfirmBusy(true);
        try {
            await archiveObjectConfig(id);
            snackbarSuccess("Config Archived");
            clearSelection();
            await fetchObjectConfigs(filters);
        } catch (e: any) {
            snackbarError(e?.message || "Failed to archive config");
        } finally {
            setConfirmBusy(false);
            setArchiveConfirm(null);
        }
    };

    const handleUnarchive = async (id: string) => {
        setConfirmBusy(true);
        try {
            await unarchiveObjectConfig(id);
            snackbarSuccess("Config Restored");
            clearSelection();
            await fetchObjectConfigs(filters);
        } catch (e: any) {
            snackbarError(e?.message || "Failed to restore config");
        } finally {
            setConfirmBusy(false);
            setArchiveConfirm(null);
        }
    };

    // ============================================
    // HANDLERS — archive / unarchive (bulk)
    // ============================================
    const handleBulkArchive = async () => {
        setConfirmBusy(true);
        try {
            await Promise.all(Array.from(selected).map(id => archiveObjectConfig(id)));
            snackbarSuccess(`${selected.size} config(s) Archived`);
            clearSelection();
            await fetchObjectConfigs(filters);
        } catch (e: any) {
            snackbarError(e?.message || "Failed to archive configs");
        } finally {
            setConfirmBusy(false);
            setArchiveConfirm(null);
        }
    };

    const handleBulkUnarchive = async () => {
        setConfirmBusy(true);
        try {
            await Promise.all(Array.from(selected).map(id => unarchiveObjectConfig(id)));
            snackbarSuccess(`${selected.size} config(s) Restored`);
            clearSelection();
            await fetchObjectConfigs(filters);
        } catch (e: any) {
            snackbarError(e?.message || "Failed to restore configs");
        } finally {
            setConfirmBusy(false);
            setArchiveConfirm(null);
        }
    };

    // ============================================
    // HANDLERS — delete (single + bulk)
    // ============================================
    const handleDelete = async (id: string) => {
        setConfirmBusy(true);
        try {
            await deleteObjectConfigById(id);
            snackbarSuccess("Config Permanently Deleted");
            clearSelection();
            await fetchObjectConfigs(filters);
        } catch (e: any) {
            snackbarError(e?.message || "Failed to delete config");
        } finally {
            setConfirmBusy(false);
            setDeleteConfirm(null);
        }
    };

    const handleBulkDelete = async () => {
        setConfirmBusy(true);
        try {
            await Promise.all(Array.from(selected).map(id => deleteObjectConfigById(id)));
            snackbarSuccess(`${selected.size} config(s) Permanently Deleted`);
            clearSelection();
            await fetchObjectConfigs(filters);
        } catch (e: any) {
            snackbarError(e?.message || "Failed to delete configs");
        } finally {
            setConfirmBusy(false);
            setDeleteConfirm(null);
        }
    };

    // ============================================
    // HANDLERS — open confirmation dialogs
    // If the clicked card is part of a multi-selection, the click acts on
    // the whole selection (bulk) instead of just that one card.
    // ============================================
    const openArchiveConfirm = (arg: string | ObjectConfig) => {
        const id = idOf(arg);
        if (!id) return;
        if (selected.size > 1 && selected.has(id)) {
            setArchiveConfirm({
                title: `Archive ${selected.size} config(s)?`,
                description: "All selected configs will be marked as archived. They stay in the database and can be restored at any time.",
                confirmLabel: "Archive",
                confirmClassName: "bg-amber-600 text-white hover:bg-amber-700",
                run: handleBulkArchive,
            });
        } else {
            setArchiveConfirm({
                title: "Archive Config?",
                description: "This will mark the config as archived. The record is kept in the database and can be restored at any time.",
                confirmLabel: "Archive",
                confirmClassName: "bg-amber-600 text-white hover:bg-amber-700",
                run: () => handleArchive(id),
            });
        }
    };

    const openUnarchiveConfirm = (arg: string | ObjectConfig) => {
        const id = idOf(arg);
        if (!id) return;
        if (selected.size > 1 && selected.has(id)) {
            setArchiveConfirm({
                title: `Restore ${selected.size} config(s)?`,
                description: "All selected configs will be restored to active.",
                confirmLabel: "Restore",
                confirmClassName: "bg-green-600 text-white hover:bg-green-700",
                run: handleBulkUnarchive,
            });
        } else {
            setArchiveConfirm({
                title: "Restore Config?",
                description: "This will restore the config to active.",
                confirmLabel: "Restore",
                confirmClassName: "bg-green-600 text-white hover:bg-green-700",
                run: () => handleUnarchive(id),
            });
        }
    };

    const openDeleteConfirm = (arg: string | ObjectConfig) => {
        const id = idOf(arg);
        if (!id) return;
        if (selected.size > 1 && selected.has(id)) {
            setDeleteConfirm({
                title: `Delete ${selected.size} config(s) forever?`,
                message: "All selected configs will be permanently removed. This cannot be undone.",
                run: handleBulkDelete,
            });
        } else {
            setDeleteConfirm({
                title: "Delete Permanently?",
                message: "This will permanently remove this config. This cannot be undone.",
                run: () => handleDelete(id),
            });
        }
    };

    // ============================================
    // RENDER
    // ============================================

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                <ShieldOff className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Access Denied</h2>
                <p className="text-muted-foreground max-w-sm">Only administrators can manage object configuration.</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className="space-y-6">
                {/* ── Header ─────────────────────────────────────────────────── */}
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <h1 className="text-2xl font-semibold">Object Config</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            YOOZ_B1_INTEGRATION.Objects Config
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" title="Refresh" onClick={handleRefresh} disabled={loadingObjectConfigs}>
                            <RefreshCw className={`h-4 w-4 ${loadingObjectConfigs ? "animate-spin" : ""}`} />
                        </Button>
                        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Config</Button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <SearchBar
                        value={searchValue}
                        onSearch={handleSearch}
                        placeholder="Search by ObjectType, DocumentType, Transaction, or endpoint..."
                    />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-[42px] min-w-[180px] px-3 justify-between
                           bg-card border border-border rounded-xl text-foreground
                           hover:bg-card/80
                           focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                           transition-all duration-200"
                            >
                                <div className="flex items-center gap-2">
                                    {getSortIcon(filters.SortBy)}
                                    <span>Sort by {filters.SortBy}</span>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-[180px]">
                            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {(["ObjectType", "DocumentType", "Transaction", "CreatedAt"] as SortField[]).map(f => (
                                <DropdownMenuItem
                                    key={f}
                                    onClick={() => toggleSort(f)}
                                    className="flex items-center justify-between"
                                >
                                    <span>{f}</span>
                                    {filters.SortBy === f && getSortIcon(f)}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {(filters.Search || filters.SortBy !== "ObjectType" || filters.SortOrder !== "asc") && (
                        <Button
                            variant="ghost"
                            className="h-[42px] rounded-xl"
                            onClick={() => {
                                setSearchValue("");
                                setFilters(prev => ({
                                    ...prev,
                                    Search: "",
                                    SortBy: "ObjectType",
                                    SortOrder: "asc",
                                    PageNumber: 0,
                                }));
                            }}
                        >
                            <X className="h-4 w-4 mr-1" />
                            Reset
                        </Button>
                    )}
                </div>

                {/* ── Bulk action bar ────────────────────────────────────────── */}
                {selCount > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-muted/50 flex-wrap">
                        <span className="text-sm font-medium mr-1">{selCount} selected</span>
                        {selectedHasActive && (
                            <Button
                                size="sm" variant="outline" className="text-amber-600 border-amber-400"
                                onClick={() => setArchiveConfirm({
                                    title: `Archive ${selCount} config(s)?`,
                                    description: "All selected configs will be marked as archived. They stay in the database and can be restored at any time.",
                                    confirmLabel: "Archive",
                                    confirmClassName: "bg-amber-600 text-white hover:bg-amber-700",
                                    run: handleBulkArchive,
                                })}
                            >
                                <Archive className="h-3.5 w-3.5 mr-1" />Archive Selected
                            </Button>
                        )}
                        {selectedHasArchived && (
                            <Button
                                size="sm" variant="outline" className="text-green-600 border-green-400"
                                onClick={() => setArchiveConfirm({
                                    title: `Restore ${selCount} config(s)?`,
                                    description: "All selected configs will be restored to active.",
                                    confirmLabel: "Restore",
                                    confirmClassName: "bg-green-600 text-white hover:bg-green-700",
                                    run: handleBulkUnarchive,
                                })}
                            >
                                <ArchiveRestore className="h-3.5 w-3.5 mr-1" />Restore Selected
                            </Button>
                        )}
                        {selectedHasArchived && (
                            <Button
                                size="sm" variant="outline" className="text-destructive border-destructive/40"
                                onClick={() => setDeleteConfirm({
                                    title: `Delete ${selCount} config(s) forever?`,
                                    message: "All selected configs will be permanently removed. This cannot be undone.",
                                    run: handleBulkDelete,
                                })}
                            >
                                <Trash2 className="h-3.5 w-3.5 mr-1" />Delete Selected
                            </Button>
                        )}
                        <Button size="sm" variant="ghost" className="ml-auto" onClick={clearSelection}>
                            <X className="h-3.5 w-3.5 mr-1" />Clear
                        </Button>
                    </div>
                )}

                {/* ── Cards ──────────────────────────────────────────────────── */}
                {loadingObjectConfigs ? (
                    <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : objectConfigs.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <Settings2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No object configs found</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {active.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        checked={active.every(c => selected.has(c.id))}
                                        onCheckedChange={v => v ? selectAll(active) : setSelected(prev => { const s = new Set(prev); active.forEach(c => s.delete(c.id)); return s; })}
                                        aria-label="Select all active"
                                    />
                                    <span className="text-xs text-muted-foreground font-medium">Active ({active.length})</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {active.map((c: ObjectConfig) => (
                                        <ObjectConfigCard
                                            key={c.id}
                                            c={c}
                                            isArchived={false}
                                            selected={selected.has(c.id)}
                                            onSelect={toggleSelect}
                                            onEdit={openEdit}
                                            onClone={handleClone}
                                            onArchive={openArchiveConfirm}
                                            onUnarchive={openUnarchiveConfirm}
                                            onDeleteForever={openDeleteConfirm}
                                            organisationLabel={() => "Mon organisation"}
                                            tenantOf={() => "Mon tenant"}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {archived.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        checked={archived.every(c => selected.has(c.id))}
                                        onCheckedChange={v => v ? selectAll(archived) : setSelected(prev => { const s = new Set(prev); archived.forEach(c => s.delete(c.id)); return s; })}
                                        aria-label="Select all archived"
                                    />
                                    <span className="text-xs text-muted-foreground font-medium">Archived ({archived.length})</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {archived.map((c: ObjectConfig) => (
                                        <ObjectConfigCard
                                            key={c.id}
                                            c={c}
                                            isArchived
                                            selected={selected.has(c.id)}
                                            onSelect={toggleSelect}
                                            onEdit={openEdit}
                                            onClone={handleClone}
                                            onArchive={() => {}}
                                            onUnarchive={openUnarchiveConfirm}
                                            onDeleteForever={openDeleteConfirm}
                                            organisationLabel={() => "Mon organisation"}
                                            tenantOf={() => "Mon tenant"}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <Pagination
                            currentPage={filters.PageNumber}
                            totalItems={paginationObjectConfigs?.TotalCount ?? 0}
                            pageSize={filters.PageSize}
                            totalPages={totalPages}
                            loading={loadingObjectConfigs}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>

            {/* ── Create / Edit Sheet ──────────────────────────────────────────── */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
                    <SheetHeader className="px-6 pt-6 pb-4 border-b">
                        <SheetTitle>{editMode ? `Edit — ${doc.ObjectType} / ${doc.Transaction}` : "New Object Config"}</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="flex-1 px-6 py-4">
                        <div className="space-y-5">
                            {isDuplicateKey() && (
                                <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3 flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                                    <div className="text-sm text-destructive">
                                        <strong>Duplicate Configuration:</strong> A config with this ObjectType, DocumentType and Transaction already exists.
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Object Type</Label>
                                    <Input list="object-type-suggestions" value={doc.ObjectType} onChange={e => setDoc(d => ({ ...d, ObjectType: e.target.value }))} placeholder="e.g. Invoices" />
                                    <datalist id="object-type-suggestions">{OBJECT_TYPES.map(ot => <option key={ot} value={ot} />)}</datalist>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Document Type</Label>
                                    <Input value={doc.DocumentType} onChange={e => setDoc(d => ({ ...d, DocumentType: e.target.value }))} placeholder="config" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Transaction</Label>
                                    <Select value={doc.Transaction} onValueChange={setTransaction}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CREATE">CREATE</SelectItem>
                                            <SelectItem value="UPDATE">UPDATE</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Accordion type="multiple" defaultValue={["source", "target", "operation"]} className="space-y-2">
                                {/* Source */}
                                <AccordionItem value="source" className="border rounded-lg px-4">
                                    <AccordionTrigger className="text-sm font-semibold">
                                        <span className="flex items-center gap-2"><Database className="h-4 w-4" />Source</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 pt-2 pb-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Source Name</Label>
                                            <Input value={cfg.source_name} onChange={e => setCfg(c => ({ ...c, source_name: e.target.value }))} placeholder="e.g. B1" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold uppercase text-muted-foreground">Fields</p>
                                            <FieldsEditor fields={cfg.source_fields} onChange={f => setCfg(c => ({ ...c, source_fields: f }))} />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Target */}
                                <AccordionItem value="target" className="border rounded-lg px-4">
                                    <AccordionTrigger className="text-sm font-semibold">
                                        <span className="flex items-center gap-2"><Target className="h-4 w-4" />Target</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 pt-2 pb-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Target Name</Label>
                                            <Input value={cfg.target_name} onChange={e => setCfg(c => ({ ...c, target_name: e.target.value }))} placeholder="e.g. Yooz" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold uppercase text-muted-foreground">Fields</p>
                                            <FieldsEditor fields={cfg.target_fields} onChange={f => setCfg(c => ({ ...c, target_fields: f }))} />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Operation */}
                                <AccordionItem value="operation" className="border rounded-lg px-4">
                                    <AccordionTrigger className="text-sm font-semibold">
                                        <span className="flex items-center gap-2"><Cog className="h-4 w-4" />Operation</span>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 pt-2 pb-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs">Type</Label>
                                                <Select value={doc.Transaction} onValueChange={setTransaction}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="CREATE">CREATE</SelectItem>
                                                        <SelectItem value="UPDATE">UPDATE</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs">Method</Label>
                                                {doc.Transaction === "CREATE" ? (
                                                    <Input value="POST" disabled className="bg-muted text-muted-foreground" />
                                                ) : (
                                                    <Select value={cfg.op_method} onValueChange={v => setCfg(c => ({ ...c, op_method: v }))}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="PATCH">PATCH</SelectItem>
                                                            <SelectItem value="PUT">PUT</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Source Endpoint</Label>
                                            <Input value={cfg.op_source_endpoint} onChange={e => setCfg(c => ({ ...c, op_source_endpoint: e.target.value }))} placeholder="/api/source/..." />
                                        </div>
                                        <div className="rounded-md border p-3 space-y-3">
                                            <p className="text-xs font-semibold uppercase text-muted-foreground">Source Endpoint Configuration</p>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs">Filter</Label>
                                                    <Input value={cfg.op_filter} onChange={e => setCfg(c => ({ ...c, op_filter: e.target.value }))} placeholder="$filter=..." />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs">Select</Label>
                                                    <Input value={cfg.op_select} onChange={e => setCfg(c => ({ ...c, op_select: e.target.value }))} placeholder="$select=..." />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs">Order By</Label>
                                                    <Input value={cfg.op_orderby} onChange={e => setCfg(c => ({ ...c, op_orderby: e.target.value }))} placeholder="$orderby=..." />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Target Endpoint</Label>
                                            <Input value={cfg.op_target_endpoint} onChange={e => setCfg(c => ({ ...c, op_target_endpoint: e.target.value }))} placeholder="/api/target/..." />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Update External ID Endpoint</Label>
                                            <Input value={cfg.op_update_externalId_endpoint} onChange={e => setCfg(c => ({ ...c, op_update_externalId_endpoint: e.target.value }))} placeholder="/api/update-id/..." />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Organization Identifier Key</Label>
                                            <Input value={cfg.op_organization_identifier_key} onChange={e => setCfg(c => ({ ...c, op_organization_identifier_key: e.target.value }))} placeholder="OrganizationUnitId" />
                                        </div>

                                        {/* Additional Config */}
                                        <div className="rounded-md border border-dashed p-3 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                                                <p className="text-xs font-semibold uppercase text-muted-foreground">Additional Config</p>
                                                {additionalCount > 0 && (
                                                    <Badge variant="secondary" className="text-xs ml-auto">
                                                        {additionalCount} {additionalCount === 1 ? "entry" : "entries"}
                                                    </Badge>
                                                )}
                                            </div>
                                            <AdditionalConfigEditor
                                                entries={cfg.op_additional_config}
                                                onChange={entries => setCfg(c => ({ ...c, op_additional_config: entries }))}
                                            />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </ScrollArea>

                    <div className="px-6 py-4 border-t flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setSheetOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving || !doc.ObjectType || isDuplicateKey()}>
                            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {editMode ? "Save Changes" : "Create Config"}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* ── Archive / Restore confirmation (AlertDialog) ─────────────────── */}
            <AlertDialog open={!!archiveConfirm} onOpenChange={open => !open && setArchiveConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{archiveConfirm?.title}</AlertDialogTitle>
                        <AlertDialogDescription>{archiveConfirm?.description}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={confirmBusy}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className={archiveConfirm?.confirmClassName}
                            disabled={confirmBusy}
                            onClick={() => archiveConfirm?.run()}
                        >
                            {confirmBusy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {archiveConfirm?.confirmLabel}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Delete confirmation (your own DeleteDialog) ──────────────────── */}
            <DeleteDialog
                isOpen={!!deleteConfirm}
                isDeleting={confirmBusy}
                title={deleteConfirm?.title ?? "Delete Permanently?"}
                message={deleteConfirm?.message ?? ""}
                onConfirm={() => deleteConfirm?.run()}
                onCancel={() => setDeleteConfirm(null)}
            />

            {/* ── Snackbar ──────────────────────────────────────────────────── */}
            <Snackbar
                message={snackbar.message}
                type={snackbar.type}
                isVisible={snackbar.isVisible}
                onClose={hideSnackbar}
            />
        </div>
    );
}