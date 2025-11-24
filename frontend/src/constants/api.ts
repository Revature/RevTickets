export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/users/login',
    LOGOUT: '/users/logout',
    REFRESH: '/users/refresh',
    PROFILE: '/users/profile',
  },
  
  // Tickets
  TICKETS: {
    BASE: '/tickets',
    BY_ID: (id: string) => `/tickets/${id}`,
    USER_TICKETS: '/tickets/user/',
    QUEUE: '/tickets/queue/',
    ASSIGNED: '/tickets/assigned/',
    ASSIGN: (id: string) => `/tickets/${id}/assign`,
    AUTO_ASSIGN: (id: string) => `/tickets/${id}/auto-assign`,
    UPDATE_STATUS: (id: string) => `/tickets/${id}/status`,
    CLOSE: (id: string) => `/tickets/${id}/close`,
    RESOLVE: (id: string) => `/tickets/${id}/resolve`,
    REOPEN: (id: string) => `/tickets/${id}/reopen`,
    CAN_REOPEN: (id: string) => `/tickets/${id}/can-reopen`,
    STATS: '/tickets/stats',
    SEARCH: '/tickets/search',
    COMMENTS: (ticketId: string) => `/tickets/${ticketId}/comments`,
    // ENHANCEMENT L1 AI ENDPOINTS
    SUMMARY: (id: string) => `/tickets/${id}/summary`,
    CLOSING_COMMENTS: (id: string) => `/tickets/${id}/closing_comments`,
  },
  
  // Categories
  CATEGORIES: {
    BASE: '/categories',
    BY_ID: (id: string) => `/categories/${id}`,
    SUBCATEGORIES: (categoryId: string) => `/categories/${categoryId}/subcategories`,
  },
  
  // Subcategories
  SUBCATEGORIES: {
    BASE: '/subcategories',
    BY_ID: (id: string) => `/subcategories/${id}`,
  },
  
  // Tags
  TAGS: {
    BASE: '/tags',
    BY_ID: (id: string) => `/tags/${id}`,
  },
  
  // Comments
  COMMENTS: {
    BY_ID: (id: string) => `/comments/${id}`,
    // ENHANCEMENT L1 COMMENT EDITING - Edit endpoint
    EDIT: (id: string) => `/comments/${id}`,
    CAN_EDIT: (id: string) => `/comments/${id}/can-edit`,
  },
  
  // Articles (Knowledge Base)
  ARTICLES: {
    BASE: '/articles',
    BY_ID: (id: string) => `/articles/${id}`,
    SEARCH: '/articles/search',
    // ENHANCEMENT L2 AI KB TAGS - AI tag generation endpoints
    GENERATE_TAGS: '/articles/generate-tags',
    GENERATE_TAGS_FROM_ARTICLE: (id: string) => `/articles/${id}/generate-tags`,
    UPDATE_AI_TAGS: (id: string) => `/articles/${id}/ai-tags`,
  },
  
  // ENHANCEMENT L2: FILE ATTACHMENTS - File API endpoints
  FILES: {
    UPLOAD: '/files/upload',
    DOWNLOAD: (id: string) => `/files/${id}/download`,
    // Ticket file attachment endpoints
    ATTACH_TO_TICKET: (ticketId: string) => `/files/tickets/${ticketId}/attach`,
    GET_TICKET_FILES: (ticketId: string) => `/files/tickets/${ticketId}`,
  },
  
  // ENHANCEMENT L3: KB CHAT - Knowledge Base Chat API endpoints
  KB_CHAT: {
    SESSIONS: '/kb-chat/sessions',
    SESSION_BY_ID: (id: string) => `/kb-chat/sessions/${id}`,
    SESSION_MESSAGES: (id: string) => `/kb-chat/sessions/${id}/messages`,
    SEND_MESSAGE: (id: string) => `/kb-chat/sessions/${id}/messages`,
    RATE_SESSION: (id: string) => `/kb-chat/sessions/${id}/rate`,
    CONVERT_TO_TICKET: (id: string) => `/kb-chat/sessions/${id}/convert-to-ticket`,
    ANALYTICS: '/kb-chat/analytics',
  },
} as const;