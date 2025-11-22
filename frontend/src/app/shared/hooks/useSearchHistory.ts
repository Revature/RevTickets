import { useState, useEffect, useCallback } from 'react';

const MAX_HISTORY_ITEMS = 5;

/**
 * Custom hook for managing search history using localStorage
 * @param storageKey - Key to use for localStorage (default: 'search-history')
 * @param maxItems - Maximum number of items to store (default: 5)
 * @returns Object containing search history and helper functions
 */
export function useSearchHistory(
  storageKey: string = 'search-history',
  maxItems: number = MAX_HISTORY_ITEMS
) {
  const [history, setHistory] = useState<string[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, maxItems));
        }
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, [storageKey, maxItems]);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }, [history, storageKey]);

  // Add a search term to history
  const addToHistory = useCallback(
    (searchTerm: string) => {
      const trimmed = searchTerm.trim();
      if (!trimmed) return;

      setHistory((prev) => {
        // Remove if already exists
        const filtered = prev.filter((item) => item !== trimmed);
        // Add to beginning
        const updated = [trimmed, ...filtered];
        // Limit to maxItems
        return updated.slice(0, maxItems);
      });
    },
    [maxItems]
  );

  // Remove a specific item from history
  const removeFromHistory = useCallback((searchTerm: string) => {
    setHistory((prev) => prev.filter((item) => item !== searchTerm));
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  }, [storageKey]);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}

