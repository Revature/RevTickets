import { apiClient } from './client';
import { API_ENDPOINTS } from '../../constants';
import type {
  ChatSession,
  ChatMessage,
  ChatResponse,
  ChatSessionCreate,
  ChatMessageRequest,
  SessionRating,
  TicketConversion,
  TicketCreationResult,
  ChatAnalytics,
} from '../../../types/chat';

export const kbChatApi = {
  /**
   * Get all chat sessions for the current user
   */
  async getSessions(): Promise<ChatSession[]> {
    return apiClient.get(API_ENDPOINTS.KB_CHAT.SESSIONS);
  },

  /**
   * Get a specific chat session by ID
   */
  async getSession(sessionId: string): Promise<ChatSession> {
    return apiClient.get(API_ENDPOINTS.KB_CHAT.SESSION_BY_ID(sessionId));
  },

  /**
   * Create a new chat session
   */
  async createSession(data?: ChatSessionCreate): Promise<ChatSession> {
    return apiClient.post(API_ENDPOINTS.KB_CHAT.SESSIONS, data || {});
  },

  /**
   * Delete a chat session
   */
  async deleteSession(sessionId: string): Promise<void> {
    return apiClient.delete(API_ENDPOINTS.KB_CHAT.SESSION_BY_ID(sessionId));
  },

  /**
   * Get messages for a specific session
   */
  async getSessionMessages(sessionId: string, limit: number = 50): Promise<ChatMessage[]> {
    return apiClient.get(API_ENDPOINTS.KB_CHAT.SESSION_MESSAGES(sessionId), {
      params: { limit },
    });
  },

  /**
   * Send a message to a chat session and get AI response
   */
  async sendMessage(sessionId: string, message: string): Promise<ChatResponse> {
    const messageData: ChatMessageRequest = { message };
    return apiClient.post(API_ENDPOINTS.KB_CHAT.SEND_MESSAGE(sessionId), messageData);
  },

  /**
   * Rate a chat session
   */
  async rateSession(sessionId: string, rating: number): Promise<void> {
    const ratingData: SessionRating = { rating };
    return apiClient.post(API_ENDPOINTS.KB_CHAT.RATE_SESSION(sessionId), ratingData);
  },

  /**
   * Convert a chat session to a support ticket
   */
  async convertToTicket(sessionId: string, ticketData: TicketConversion): Promise<TicketCreationResult> {
    return apiClient.post(API_ENDPOINTS.KB_CHAT.CONVERT_TO_TICKET(sessionId), ticketData);
  },

  /**
   * Get chat analytics dashboard data
   */
  async getAnalytics(days: number = 30): Promise<ChatAnalytics> {
    return apiClient.get(API_ENDPOINTS.KB_CHAT.ANALYTICS, {
      params: { days },
    });
  },
};

