import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for debounced search functionality
 * @param searchFn - Function to execute when search is triggered
 * @param delay - Debounce delay in milliseconds (default: 300ms)
 * @returns Object containing search state and helper functions
 */
export function useDebounceSearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  delay: number = 300
) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [query, delay]);

  // Execute search when debounced query changes
  useEffect(() => {
    const executeSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setError(null);
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setError(null);
        const searchResults = await searchFn(debouncedQuery);
        setResults(searchResults);
      } catch (err) {
        // Don't set error if request was aborted
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message || 'Search failed');
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    };

    executeSearch();

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedQuery, searchFn]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setResults([]);
    setError(null);
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    debouncedQuery,
    results,
    loading,
    error,
    clearSearch,
    resetError,
    isSearching: query.length > 0,
  };
}

