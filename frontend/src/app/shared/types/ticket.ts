// Ticket-related types matching backend API
import { Category } from './category';
import { SubCategory } from './subcategory';

export type TicketStatus = 'new' | 'in_progress' | 'waiting_for_customer' | 'waiting_for_agent' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

// Rich text content structure
export interface RichTextContent {
  html: string;
  json: Record<string, unknown>;
  text: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  content: RichTextContent;
  category: Category;
  subCategory: SubCategory;
  userInfo: UserInfo;
  agentInfo?: UserInfo;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name?: string;
  role?: string; // "user" or "agent" - helps identify user type in comments and tickets
}

export interface CreateTicketRequest {
  category_id: string;
  sub_category_id: string;
  title: string;
  description: string;
  content: RichTextContent;
  priority?: TicketPriority;
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  content?: RichTextContent;
  status?: TicketStatus;
  priority?: TicketPriority;
  agent_id?: string;
}

export interface TicketStats {
  total: number;
  new: number;
  in_progress: number;
  waiting_for_customer: number;
  waiting_for_agent: number;
  resolved: number;
  closed: number;
  by_priority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

export interface Comment {
  id: string;
  ticket_id: string;
  user: UserInfo;
  content: RichTextContent;
  createdAt: string;
  updatedAt: string;
  // ENHANCEMENT L1 COMMENT EDITING - Add edit tracking fields
  edited?: boolean;
  edit_count?: number;
  edit_history?: CommentEditHistory[];
}

// ENHANCEMENT L1 COMMENT EDITING - Edit history tracking
export interface CommentEditHistory {
  edited_at: string;
  previous_content?: RichTextContent;
}

export interface CreateComment {
  content: RichTextContent;
}

export interface UpdateComment {
  content: RichTextContent;
}

export type CreateTicket = CreateTicketRequest;
export type UpdateTicket = UpdateTicketRequest;

export interface TicketAssignment {
  agent_id: string;
}

export interface TicketClosure {
  resolution: string;
}