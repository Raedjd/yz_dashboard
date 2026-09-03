import {Card, CardContent, CardHeader, CardTitle} from "@client/shared/components/ui/card";
import {Checkbox} from "@client/shared/components/ui/checkbox";
import {Badge} from "@client/shared/components/ui/badge";
import {Button} from "@client/shared/components/ui/button";
import {Archive, ArchiveRestore, Copy, Database, Globe, Pencil, Trash2} from "lucide-react";

const txColor: Record<string, string> = {
    CREATE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    UPDATE: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

export function ObjectConfigCard({ c, isArchived, selected, onSelect, onEdit, onClone, onArchive, onUnarchive, onDeleteForever, organisationLabel, tenantOf }: {
    c: any; isArchived: boolean; selected: boolean;
    onSelect: (id: string, checked: boolean) => void;
    onEdit: (raw: any) => void; onClone: (raw: any) => void;
    onArchive: (id: string) => void; onUnarchive: (id: string) => void; onDeleteForever: (id: string) => void;
    organisationLabel: (name: string | null | undefined) => string;
    tenantOf: (name: string) => string;
}) {
    return (
        <Card className={`relative transition-all ${isArchived ? "border-amber-300 dark:border-amber-700 opacity-75" : ""} ${selected ? "ring-2 ring-primary" : ""}`}>
            <div className="absolute top-3 left-3 z-10">
                <Checkbox checked={selected} onCheckedChange={(v) => onSelect(c.id, !!v)} aria-label="Select" />
            </div>
            <CardHeader className="pb-2 pl-10">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-tight">{c.ObjectType}</CardTitle>
                    <div className="flex items-center gap-1 shrink-0">
                        {isArchived && <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">Archived</Badge>}
                        <Button size="icon" variant="ghost" className="h-7 w-7" title="Edit" onClick={() => onEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground" title="Clone" onClick={() => onClone(c)}><Copy className="h-3.5 w-3.5" /></Button>
                        {!isArchived ? (
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-amber-600" title="Archive" onClick={() => onArchive(c.id)}><Archive className="h-3.5 w-3.5" /></Button>
                        ) : (
                            <>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" title="Unarchive" onClick={() => onUnarchive(c.id)}><ArchiveRestore className="h-3.5 w-3.5" /></Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" title="Delete Forever" onClick={() => onDeleteForever(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-2 pl-10">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${txColor[c.Transaction] || "bg-muted text-muted-foreground"}`}>{c.Transaction}</span>
                    <span className="text-xs text-muted-foreground">{c.DocumentType}</span>
                    <Badge variant={c.Organisation ? "default" : "outline"} className="text-xs gap-1">
                        {c.Organisation ? <Database className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                        {c.Organisation
                            ? `${tenantOf(c.Organisation)} · ${organisationLabel(c.Organisation)}`
                            : "Global"}
                    </Badge>
                </div>
                {c.Config?.operation?.source_endpoint && (
                    <p className="text-xs text-muted-foreground font-mono truncate" title={c.Config.operation.source_endpoint}>
                        {c.Config.operation.source_endpoint}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}