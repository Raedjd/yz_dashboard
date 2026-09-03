// src/shared/components/AutoComplete.types.ts

export interface AutocompleteItem {
    [key: string]: any;
}

export interface PaginationType {
    PageNumber: number;
    PageSize: number;
    TotalCount: number;
    TotalPages: number;
}

export interface AutocompleteProps<T extends AutocompleteItem> {
    // Data props
    items: T[];
    loading?: boolean;
    pagination?: PaginationType | null;

    // Callback props
    onSearch: (searchValue: string) => void;
    onLoadMore?: () => void;
    onSelect: (item: T | null) => void;

    // Value props
    value?: string | number;

    // Display props
    placeholder?: string;
    displayKey?: keyof T | string;
    valueKey?: keyof T | string;

    // Label props
    label?: string;
    required?: boolean;

    // State props
    error?: string;
    disabled?: boolean;

    // Custom render
    renderItem?: (item: T) => React.ReactNode;

    // Debounce
    debounceMs?: number;

    // Additional props
    className?: string;
    name?: string;
}

// src/shared/components/AutoComplete.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronDown, Loader2, AlertCircle } from 'lucide-react';

const Autocomplete = <T extends AutocompleteItem>({
                                                      items = [],
                                                      loading = false,
                                                      pagination = null,
                                                      onSearch,
                                                      onLoadMore,
                                                      onSelect,
                                                      value = '',
                                                      placeholder = 'Search...',
                                                      displayKey = '',
                                                      valueKey = 'Id',
                                                      label = '',
                                                      required = false,
                                                      error = '',
                                                      disabled = false,
                                                      renderItem,
                                                      debounceMs = 3000,
                                                      name = ''
                                                  }: AutocompleteProps<T>) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedItem, setSelectedItem] = useState<T | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);



    useEffect(() => {
        if (value && items.length > 0) {
            const found = items.find(item => item[valueKey as string] === value);
            if (found) {
                setSelectedItem(found);
                setSearchTerm(String(found[displayKey as string] || ''));
            }
        } else if (!value) {
            setSelectedItem(null);
            setSearchTerm('');
        }
    }, [value, items, valueKey, displayKey]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Debounce de la recherche
    const handleSearchChange = (newValue: string): void => {
        setSearchTerm(newValue);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            onSearch(newValue);
        }, debounceMs);
    };

    const handleSelect = (item: T): void => {
        setSelectedItem(item);
        setSearchTerm(String(item[displayKey as string] || ''));
        setIsOpen(false);
        onSelect(item);
    };

    const handleClear = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.stopPropagation();
        setSelectedItem(null);
        setSearchTerm('');
        setIsOpen(false);
        onSelect(null);
        onSearch('');
    };

    const handleInputClick = (): void => {
        if (!disabled) {
            setIsOpen(true);
            if (!searchTerm) {
                onSearch('');
            }
        }
    };

    const handleLoadMore = (): void => {
        if (onLoadMore && pagination && pagination.PageNumber < pagination.TotalPages - 1) {
            onLoadMore();
        }
    };

    // Rendu par défaut d'un item
    const defaultRenderItem = (item: T): React.ReactNode => (
        <div className="flex flex-col">
      <span className="font-medium text-gray-900">
        {String(item[displayKey as string] || '')}
      </span>
            {item.Description && (
                <span className="text-xs text-gray-500 mt-0.5">
          {String(item.Description)}
        </span>
            )}
        </div>
    );

    const hasMore = pagination && pagination.PageNumber < pagination.TotalPages - 1;

    return (
        <div ref={dropdownRef} className={`relative w-full`}>
            {/* Label */}
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Input Container */}
            <div className="relative " >
                <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    name={name}
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onClick={handleInputClick}
                    onFocus={handleInputClick}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full pl-9 sm:pl-11 pr-20 sm:pr-24 py-2 sm:py-3 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-offset-0 transition-all outline-none font-medium text-sm sm:text-base ${
                        error
                            ? 'border-red-500 focus:ring-red-200 bg-red-50/50'
                            : 'border-gray-200 focus:ring-focus-blue/20 focus:border-focus-blue'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    autoComplete="off"
                />

                {/* Action Buttons */}
                <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {selectedItem && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                            aria-label="Clear selection"
                        >
                            <X size={16} className="text-gray-500" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleInputClick}
                        disabled={disabled}
                        className={`p-1.5 hover:bg-gray-200 rounded-lg transition-colors ${
                            disabled ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        aria-label="Toggle dropdown"
                    >
                        <ChevronDown
                            size={16}
                            className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-2 flex items-start gap-2 text-red-600">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl overflow-hidden">
                    {/* Loading State */}
                    {loading && items.length === 0 && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 size={24} className="text-focus-yellow animate-spin" />
                            <span className="ml-3 text-gray-600 font-medium">Loading...</span>
                        </div>
                    )}

                    {/* No Results */}
                    {!loading && items.length === 0 && (
                        <div className="text-center py-8 px-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Search className="text-gray-400" size={24} />
                            </div>
                            <p className="text-gray-500 font-medium">No results found</p>
                            <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                        </div>
                    )}

                    {/* Items List */}
                    {items.length > 0 && (
                        <div className="max-h-64 sm:max-h-80 overflow-y-auto">
                            {items.map((item :any, index : any) => {
                                const itemValue = item[valueKey as string];
                                const selectedValue = selectedItem?.[valueKey as string];
                                const isSelected = selectedValue === itemValue;

                                return (
                                    <button
                                        key={String(itemValue || index)}
                                        type="button"
                                        onClick={() => handleSelect(item)}
                                        className={`w-full px-4 py-3 text-left hover:bg-yellow-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                            isSelected
                                                ? 'bg-yellow-50 border-l-4 border-l-yellow-500'
                                                : ''
                                        }`}
                                    >
                                        {renderItem ? renderItem(item) : defaultRenderItem(item)}
                                    </button>
                                );
                            })}

                            {/* Load More Button */}
                            {hasMore && (
                                <button
                                    type="button"
                                    onClick={handleLoadMore}
                                    disabled={loading}
                                    className="w-full px-4 py-3 text-center text-yellow-600 hover:bg-yellow-50 font-medium transition-colors border-t border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Loading more...
                    </span>
                                    ) : (
                                        `Load more (${items.length} of ${pagination?.TotalCount || 0})`
                                    )}
                                </button>
                            )}

                            {/* Pagination Info */}
                            {pagination && (
                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
                                    Showing {items.length} of {pagination.TotalCount} results
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Autocomplete;