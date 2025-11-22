'use client';

import { TextInput } from 'flowbite-react';
import { Search, X, Loader2 } from 'lucide-react';
import { forwardRef } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  showClearButton?: boolean;
  recentSearches?: string[];
  onRecentSearchClick?: (search: string) => void;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value,
      onChange,
      onClear,
      placeholder = 'Search...',
      loading = false,
      disabled = false,
      autoFocus = false,
      className = '',
      showClearButton = true,
      recentSearches = [],
      onRecentSearchClick,
    },
    ref
  ) => {
    const handleClear = () => {
      onChange('');
      onClear?.();
    };

    return (
      <div className={`relative ${className}`}>
        <div className="relative">
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {loading ? (
              <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
            ) : (
              <Search className="h-4 w-4 text-gray-400" />
            )}
          </div>

          {/* Input Field */}
          <TextInput
            ref={ref}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            className="pl-10 pr-10"
            style={{ paddingLeft: '2.5rem', paddingRight: showClearButton && value ? '2.5rem' : '1rem' }}
          />

          {/* Clear Button */}
          {showClearButton && value && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Recent Searches Dropdown */}
        {recentSearches.length > 0 && !value && (
          <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1">
                Recent Searches
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => onRecentSearchClick?.(search)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center space-x-2"
                  >
                    <Search className="h-3 w-3 text-gray-400" />
                    <span className="truncate">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';

