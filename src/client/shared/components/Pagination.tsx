import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    totalPages: number;
    loading: boolean;
    onPageChange: (page: number) => void;
}

export default function Pagination({
                                       currentPage,
                                       totalItems,
                                       pageSize,
                                       totalPages,
                                       loading,
                                       onPageChange
                                   }: PaginationProps) {

    const getPaginationRange = () => {
        if (totalPages === 0 || !totalPages || isNaN(totalPages)) return [];

        const range = [];
        const showPages = 3;
        let start = Math.max(0, currentPage - Math.floor(showPages / 2));
        let end = Math.min(totalPages, start + showPages);

        if (end - start < showPages) {
            start = Math.max(0, end - showPages);
        }

        for (let i = start; i < end; i++) {
            range.push(i);
        }
        return range;
    };

    if (totalItems === 0) return null;

    return (
        <div className="px-6 py-4 border-t border-border bg-muted/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{currentPage * pageSize + 1}</span> to{' '}
                    <span className="font-medium text-foreground">
                {Math.min((currentPage + 1) * pageSize, totalItems)}
            </span>{' '}
                    of <span className="font-medium text-foreground">{totalItems}</span> item(s)
                </p>

                <div className="flex items-center gap-2">
                    {/* First Page */}
                    <button
                        onClick={() => onPageChange(0)}
                        disabled={currentPage === 0 || loading}
                        className="p-2 rounded-lg border border-border text-muted-foreground hover-elevate disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="First page"
                    >
                        <ChevronsLeft size={18} />
                    </button>

                    {/* Previous Page */}
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 0 || loading}
                        className="p-2 rounded-lg border border-border text-muted-foreground hover-elevate disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Previous page"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    {/* Page Numbers */}
                    <div className="hidden sm:flex items-center gap-1">
                        {getPaginationRange().map((page) => (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                disabled={loading}
                                className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                                    page === currentPage
                                        ? 'active-page-gradient'
                                        : 'border border-border text-foreground hover-elevate disabled:opacity-50'
                                }`}
                            >
                                {page + 1}
                            </button>
                        ))}
                    </div>

                    {/* Current Page (Mobile) */}
                    <div className="sm:hidden px-4 py-2 text-sm font-medium text-foreground">
                        {currentPage + 1} / {totalPages}
                    </div>

                    {/* Next Page */}
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1 || loading}
                        className="p-2 rounded-lg border border-border text-muted-foreground hover-elevate disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Next page"
                    >
                        <ChevronRight size={18} />
                    </button>

                    {/* Last Page */}
                    <button
                        onClick={() => onPageChange(totalPages - 1)}
                        disabled={currentPage >= totalPages - 1 || loading}
                        className="p-2 rounded-lg border border-border text-muted-foreground hover-elevate disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Last page"
                    >
                        <ChevronsRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}