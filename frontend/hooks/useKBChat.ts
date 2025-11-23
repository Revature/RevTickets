// ENHANCEMENT L3: KB CHAT - Custom hook for KB chat functionality

import { useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { API_BASE_URL } from '../src/constants/api';

interface Source {
  id: string;
  title: string;
  excerpt: string;
  relevance: number;
  url: string;
}

interface ChatResponse {
  response: string;
  sources: Source[];
  session_id: string;
  timestamp: string;
  error?: string;
}

interface TicketConversion {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category_id?: string;
  subcategory_id?: string;
}

interface TicketCreationResult {
  message: string;
  ticket_id: string;
}

export const useKBChat = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const getToken = () => localStorage.getItem('authToken');

  const sendMessage = async (sessionId: string, message: string): Promise<ChatResponse> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/kb-chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const data: ChatResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const rateSession = async (sessionId: string, rating: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/kb-chat/sessions/${sessionId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ rating })
      });

      if (!response.ok) {
        throw new Error(`Failed to rate session: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error rating session:', error);
      throw error;
    }
  };

  const convertToTicket = async (
    sessionId: string, 
    ticketData: TicketConversion
  ): Promise<TicketCreationResult> => {
    try {
      const response = await fetch(`${API_BASE_URL}/kb-chat/sessions/${sessionId}/convert-to-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(ticketData)
      });

      if (!response.ok) {
        throw new Error(`Failed to convert to ticket: ${response.statusText}`);
      }

      const result: TicketCreationResult = await response.json();
      return result;
    } catch (error) {
      console.error('Error converting to ticket:', error);
      throw error;
    }
  };

  const getSessionMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/kb-chat/sessions/${sessionId}/messages`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get messages: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting session messages:', error);
      throw error;
    }
  };

  return {
    sendMessage,
    rateSession,
    convertToTicket,
    getSessionMessages,
    loading
  };
};