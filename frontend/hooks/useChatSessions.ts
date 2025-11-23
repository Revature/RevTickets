// ENHANCEMENT L3: KB CHAT - Custom hook for managing chat sessions

import { useState, useEffect } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { API_BASE_URL } from '../src/constants/api';

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  is_active: boolean;
  topics_discussed: string[];
  satisfaction_rating?: number;
  converted_to_ticket: boolean;
}

export const useChatSessions = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const getToken = () => localStorage.getItem('authToken');

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/kb-chat/sessions`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.statusText}`);
      }

      const data = await response.json();
      // Deduplicate sessions by ID
      const uniqueSessions = data.filter((session: ChatSession, index: number, self: ChatSession[]) =>
        index === self.findIndex((s: ChatSession) => s.id === session.id)
      );
      setSessions(uniqueSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (initialMessage?: string): Promise<ChatSession> => {
    try {
      const response = await fetch(`${API_BASE_URL}/kb-chat/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ initial_message: initialMessage })
      });

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.statusText}`);
      }

      const newSession = await response.json();
      // Check if session already exists to prevent duplicates
      setSessions(prev => {
        const exists = prev.some(s => s.id === newSession.id);
        if (exists) {
          return prev; // Don't add duplicate
        }
        return [newSession, ...prev];
      });
      return newSession;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  const deleteSession = async (sessionId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/kb-chat/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete session: ${response.statusText}`);
      }

      setSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  };

  const getSession = async (sessionId: string): Promise<ChatSession | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/kb-chat/sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  };

  const refreshSessions = () => {
    fetchSessions();
  };

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  return {
    sessions,
    loading,
    createSession,
    deleteSession,
    getSession,
    refreshSessions
  };
};