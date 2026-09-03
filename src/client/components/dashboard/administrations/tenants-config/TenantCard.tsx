import {Card, CardContent, CardHeader, CardTitle} from "@client/shared/components/ui/card";
import {Archive, ArchiveRestore, Database, Pencil, Trash2, Users} from "lucide-react";
import {Button} from "@client/shared/components/ui/button";
import {Badge} from "@client/shared/components/ui/badge";
import {Checkbox} from "@client/shared/components/ui/checkbox";



export function TenantCard({ t, isArchived, selected, onSelect, onEdit, onArchive, onUnarchive, onDeleteForever }: {
    t: any;
    isArchived: boolean;
    selected: boolean;
    onSelect: (id: string, checked: boolean) => void;
    onEdit: (raw: any) => void;
    onArchive: (id: string) => void;
    onUnarchive: (id: string) => void;
    onDeleteForever: (id: string) => void;
}) {
    console.log("xxxxxxx",t)
    return (
        <Card className={`relative transition-all ${isArchived ? "opacity-60 border-amber-300 dark:border-amber-700" : ""} ${selected ? "ring-2 ring-primary" : ""}`}>
            <div className="absolute top-3 left-3 z-10">
                <Checkbox
                    checked={selected}
                    onCheckedChange={(v) => onSelect(t.id, !!v)}
                    aria-label="Select"
                />
            </div>
            <CardHeader className="pb-3 pl-10">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-tight">{t.TenantName}</CardTitle>
                    <div className="flex items-center gap-1 shrink-0">
                        {isArchived && (
                            <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">Archived</Badge>
                        )}
                        <Button size="icon" variant="ghost" className="h-7 w-7" title="Edit" onClick={() => onEdit(t)}>
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {!isArchived ? (
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-amber-600" title="Archive" onClick={() => onArchive(t.id)}>
                                <Archive className="h-3.5 w-3.5" />
                            </Button>
                        ) : (
                            <>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" title="Unarchive" onClick={() => onUnarchive(t.id)}>
                                    <ArchiveRestore className="h-3.5 w-3.5" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" title="Delete Forever" onClick={() => onDeleteForever(t.id)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground pl-10">
                <p className="line-clamp-2">{t.Description || "—"}</p>
                <div className="flex gap-4 pt-1">
          <span className="flex items-center gap-1">
            <Database className="h-3.5 w-3.5" />
            FinDimSet: <strong className="text-foreground">{t.FinDimSet}</strong>
          </span>
                    <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
                        {(t.Organizations || []).length} org{(t.Organizations || []).length !== 1 ? "s" : ""}
          </span>
                </div>
            </CardContent>
        </Card>
    );
}