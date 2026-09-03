import { Search } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
    value: string;
    onSearch: (value: string) => void; // On garde seulement onSearch
    placeholder?: string;
}

export default function SearchBar({ value, onSearch, placeholder }: SearchBarProps) {
    const [localValue, setLocalValue] = useState(value);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const trimmedValue = localValue.trim();
            if (trimmedValue && /^[*+?.()\[\]{}^$|\\]/.test(trimmedValue)) {
                return;
            }
            onSearch(localValue);
        }
    };

    return (
        <div className="relative w-full max-w-md">
            <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
            />
            <input
                type="text"
                placeholder={placeholder || "Search..."}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground
                   focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                   transition-all duration-200"
            />
        </div>
    );
}
