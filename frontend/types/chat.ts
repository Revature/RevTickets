// ENHANCEMENT L3: KB CHAT - TypeScript types for chat functionality

export interface Source {
  id: string;
  title: string;
  excerpt: string;
  relevance: number;
  url: string;
}

export interface ChatMessage {
  id: string;
  message: string;
  message_type: 'user' | 'assistant' | 'system';
  timestamp: string;
  sources: Source[];
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  is_active: boolean;
  topics_discussed: string[];
  satisfaction_rating?: number;
  converted_to_ticket: boolean;
  ticket_id?: string;
}

export interface ChatResponse {
  response: string;
  sources: Source[];
  session_id: string;
  timestamp: string;
  error?: string;
}

export interface ChatSessionCreate {
  initial_message?: string;
}

export interface ChatMessageRequest {
  message: string;
}

export interface SessionRating {
  rating: number; // 1-5
}

export interface TicketConversion {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category_id?: string;
  subcategory_id?: string;
}

export interface TicketCreationResult {
  message: string;
  ticket_id: string;
}

// Chat states
export type ChatType = 'kb_chat' | 'live_chat';

// Chat Analytics Types
export interface ChatAnalytics {
  summary: {
    total_sessions: number;
    total_messages: number;
    active_sessions: number;
    converted_sessions: number;
    avg_messages_per_session: number;
    conversion_rate: number;
    avg_satisfaction_rating: number;
    avg_session_duration_minutes: number;
    user_messages: number;
    assistant_messages: number;
  };
  top_articles: Array<{
    article_id: string;
    title: string;
    reference_count: number;
  }>;
  sessions_trend: Array<{
    date: string;
    count: number;
  }>;
  top_topics: Array<{
    topic: string;
    count: number;
  }>;
  date_range: {
    start_date: string;
    end_date: string;
    days: number;
  };
}

// Chat Analytics Types
export interface ChatAnalytics {
  summary: {
    total_sessions: number;
    total_messages: number;
    active_sessions: number;
    converted_sessions: number;
    avg_messages_per_session: number;
    conversion_rate: number;
    avg_satisfaction_rating: number;
    avg_session_duration_minutes: number;
    user_messages: number;
    assistant_messages: number;
  };
  top_articles: Array<{
    article_id: string;
    title: string;
    reference_count: number;
  }>;
  sessions_trend: Array<{
    date: string;
    count: number;
  }>;
  top_topics: Array<{
    topic: string;
    count: number;
  }>;
  date_range: {
    start_date: string;
    end_date: string;
    days: number;
  };
}

export interface ChatIntent {
  intent: 'question' | 'help_request' | 'problem_report' | 'acknowledgment' | 'general';
  confidence: number;
  topics: string[];
}