import { useState, useEffect, useCallback } from 'react';
import { kbChatApi } from '../lib/api';
import type { ChatMessage, ChatSession } from '../../types/chat';

interface UseChatHistoryOptions {
  sessionId: string | null;
  autoLoad?: boolean;
}

interface UseChatHistoryReturn {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  loadMessages: () => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  refreshMessages: () => Promise<void>;
}

/**
 * Hook for managing chat message history
 * Provides functionality to load, add, and manage chat messages for a session
 */
export const useChatHistory = (
  options: UseChatHistoryOptions
): UseChatHistoryReturn => {
  const { sessionId, autoLoad = true } = options;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load messages for the current session
   */
  const loadMessages = useCallback(async () => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sessionMessages = await kbChatApi.getSessionMessages(sessionId);
      setMessages(sessionMessages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load messages';
      setError(errorMessage);
      console.error('Error loading chat messages:', err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  /**
   * Add a message to the current messages list
   */
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  /**
   * Refresh messages from the server
   */
  const refreshMessages = useCallback(async () => {
    await loadMessages();
  }, [loadMessages]);

  // Auto-load messages when sessionId changes
  useEffect(() => {
    if (autoLoad && sessionId) {
      loadMessages();
    } else if (!sessionId) {
      clearMessages();
    }
  }, [sessionId, autoLoad, loadMessages, clearMessages]);

  return {
    messages,
    loading,
    error,
    loadMessages,
    addMessage,
    clearMessages,
    refreshMessages,
  };
};

