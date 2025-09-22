'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchResult {
  id: string;
  name: string;
  category?: string;
  price?: number;
  image?: string;
}

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  isLoading?: boolean;
  results?: SearchResult[];
  onResultSelect?: (result: SearchResult) => void;
  debounceTime?: number;
  className?: string;
}

export default function SearchBar({
  placeholder = "Search menu items...",
  onSearch,
  onClear,
  isLoading = false,
  results = [],
  onResultSelect,
  debounceTime = 300,
  className = ""
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.trim()) {
        onSearch(query);
      } else if (onClear) {
        onClear();
      }
    }, debounceTime);

    return () => clearTimeout(handler);
  }, [query, debounceTime, onSearch, onClear]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery('');
    if (onClear) onClear();
    inputRef.current?.focus();
  };

  const handleResultSelect = (result: SearchResult) => {
    if (onResultSelect) {
      onResultSelect(result);
      setQuery(result.name);
      setIsFocused(false);
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
        />
        {query && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {isLoading ? (
              <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
            ) : (
              <button
                onClick={handleClear}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isFocused && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="py-2 max-h-60 overflow-auto">
            {results.map((result) => (
              <button
                key={result.id}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none transition-colors"
                onClick={() => handleResultSelect(result)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {result.name}
                    </p>
                    {result.category && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {result.category}
                      </p>
                    )}
                  </div>
                  {result.price && (
                    <div className="ml-2 flex-shrink-0">
                      <p className="text-sm font-medium text-yellow-500">
                        Rs {result.price.toLocaleString('en-PK')}
                      </p>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}