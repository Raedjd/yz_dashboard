import {AlertCircle, Trash2, RefreshCw, X} from 'lucide-react';

interface DeleteDialogProps {
    isOpen: boolean;
    isDeleting: boolean;
    title?: string;
    message?: string;
    warningMessage?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function DeleteDialog({
                                         isOpen,
                                         isDeleting,
                                         title = "Confirm Deletion",
                                         message = "Are you sure you want to delete this item?",
                                         warningMessage = "This action cannot be undone and will permanently remove this item from your system.",
                                         onConfirm,
                                         onCancel
                                     }: DeleteDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-card-border">
                {/* Icon & Header */}
                <div className="relative bg-gradient-to-br from-destructive to-destructive/80 px-6 py-8 text-center">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="absolute top-4 right-4 p-1.5 rounded-full text-destructive-foreground/70 hover:text-destructive-foreground hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>

                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} className="text-destructive-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold text-destructive-foreground">
                        {title}
                    </h2>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                    <p className="text-foreground text-center text-lg mb-2">
                        {message}
                    </p>
                    <p className="text-muted-foreground text-center text-sm">
                        {warningMessage}
                    </p>

                    {/* Warning Box */}
                    <div className="mt-4 bg-destructive/10 border-2 border-destructive/20 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle size={20} className="text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-destructive">Warning</p>
                            <p className="text-xs text-destructive/80 mt-1">
                                All associated data will be permanently deleted.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-muted/50 border-t border-border flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="px-5 py-2.5 text-foreground bg-card border-2 border-border hover-elevate rounded-xl font-semibold
                           transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-5 py-2.5 bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground rounded-xl font-semibold
                           hover:shadow-lg hover:shadow-destructive/40 transition-all duration-200 hover:scale-105
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                    >
                        {isDeleting ? (
                            <>
                                <RefreshCw size={18} className="animate-spin" />
                                <span>Deleting...</span>
                            </>
                        ) : (
                            <>
                                <Trash2 size={18} />
                                <span>Delete</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}