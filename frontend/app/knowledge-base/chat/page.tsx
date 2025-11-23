'use client';

// ENHANCEMENT L3: KB CHAT - Main knowledge base chat interface

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge, Spinner, Tooltip, Modal, ModalHeader, ModalBody, TextInput, Select, Label } from 'flowbite-react';
import { Plus, Trash2, Ticket, Star, AlertCircle, BarChart3 } from 'lucide-react';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useKBChat } from '@/hooks/useKBChat';
import { useChatHistory } from '@/src/hooks/useChatHistory';
import { ChatInterface } from '@/src/app/shared/components';
import { ChatMessage } from '@/types/chat';
import { kbChatApi, categoriesApi, subCategoriesApi } from '@/src/lib/api';
import type { Category, SubCategory } from '@/src/app/shared/types';

export default function KBChatPage() {
  const router = useRouter();
  
  // Restore currentSessionId from sessionStorage on mount
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('kb_chat_current_session_id') || null;
    }
    return null;
  });
  
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [sessionRating, setSessionRating] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [ticketData, setTicketData] = useState<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    category_id?: string;
    subcategory_id?: string;
  }>({
    title: '',
    description: '',
    priority: 'medium',
    category_id: undefined,
    subcategory_id: undefined
  });

  const {
    sessions,
    loading: sessionsLoading,
    createSession,
    deleteSession,
    refreshSessions,
    getSession
  } = useChatSessions();

  const {
    sendMessage,
    loading: messageLoading,
    rateSession,
    convertToTicket
  } = useKBChat();

  // Use the chat history hook for managing messages
  const {
    messages,
    loading: messagesLoading,
    addMessage,
    clearMessages,
    refreshMessages
  } = useChatHistory({
    sessionId: currentSessionId,
    autoLoad: true
  });

  // Persist currentSessionId to sessionStorage whenever it changes
  useEffect(() => {
    if (currentSessionId) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('kb_chat_current_session_id', currentSessionId);
      }
    } else {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('kb_chat_current_session_id');
      }
    }
  }, [currentSessionId]);

  // Verify and restore session when sessions are loaded
  useEffect(() => {
    const restoreSession = async () => {
      // Wait for sessions to finish loading
      if (sessionsLoading) return;
      
      // If we have a restored sessionId, verify it exists
      if (currentSessionId) {
        const sessionExists = sessions.some(s => s.id === currentSessionId);
        if (!sessionExists) {
          // Session not in list, verify with API
          const session = await getSession(currentSessionId);
          if (session) {
            // Session exists, refresh sessions list to include it
            refreshSessions();
          } else {
            // Session doesn't exist, clear it
            setCurrentSessionId(null);
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('kb_chat_current_session_id');
            }
          }
        }
      } else {
        // No current session, try to restore from sessionStorage
        if (typeof window !== 'undefined') {
          const savedSessionId = sessionStorage.getItem('kb_chat_current_session_id');
          if (savedSessionId && sessions.length > 0) {
            const sessionExists = sessions.some(s => s.id === savedSessionId);
            if (sessionExists) {
              setCurrentSessionId(savedSessionId);
            } else {
              // Verify with API
              const session = await getSession(savedSessionId);
              if (session) {
                setCurrentSessionId(savedSessionId);
                refreshSessions();
              } else {
                sessionStorage.removeItem('kb_chat_current_session_id');
              }
            }
          }
        }
      }
    };

    restoreSession();
  }, [sessions, sessionsLoading, currentSessionId, getSession, refreshSessions]);

  const handleStartNewChat = async () => {
    try {
      const session = await createSession();
      setCurrentSessionId(session.id);
      clearMessages();
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (!currentSessionId || messageLoading) return;

    // Add user message immediately for better UX
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: messageText,
      message_type: 'user',
      timestamp: new Date().toISOString(),
      sources: []
    };
    addMessage(userMessage);

    try {
      const response = await sendMessage(currentSessionId, messageText);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: response.response,
        message_type: 'assistant',
        timestamp: response.timestamp,
        sources: response.sources || []
      };

      addMessage(assistantMessage);
      
      if (response.error) {
        console.error('Chat error:', response.error);
      }

      // Refresh session list to update message count
      refreshSessions();
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: 'Sorry, I encountered an error processing your message. Please try again.',
        message_type: 'assistant',
        timestamp: new Date().toISOString(),
        sources: []
      };
      
      addMessage(errorMessage);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        clearMessages();
        // Remove from sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('kb_chat_current_session_id');
        }
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleRateSession = async () => {
    if (!currentSessionId || sessionRating === 0) return;
    
    try {
      await rateSession(currentSessionId, sessionRating);
      setShowRatingModal(false);
      setSessionRating(0);
      refreshSessions();
    } catch (error) {
      console.error('Failed to rate session:', error);
    }
  };

  const handleConvertToTicket = async () => {
    if (!currentSessionId || !ticketData.title.trim()) return;
    
    // Validate required fields
    if (!ticketData.category_id || !ticketData.subcategory_id) {
      alert('Please select both category and subcategory');
      return;
    }
    
    try {
      const result = await convertToTicket(currentSessionId, {
        title: ticketData.title,
        description: ticketData.description,
        priority: ticketData.priority,
        category_id: ticketData.category_id,
        subcategory_id: ticketData.subcategory_id
      });
      // Close modal first
      setShowTicketModal(false);
      
      // Navigate immediately to tickets list page (no dialogs, no delays)
      router.push('/tickets?success=created');
      
      // Reset form data after navigation
      setTicketData({ 
        title: '', 
        description: '', 
        priority: 'medium',
        category_id: undefined,
        subcategory_id: undefined
      });
      
      // Refresh sessions in background
      refreshSessions();
    } catch (error: unknown) {
      console.error('Failed to convert to ticket:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to create ticket: ${errorMessage}`);
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    // Persist to sessionStorage immediately
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('kb_chat_current_session_id', sessionId);
    }
  };

  // Load categories when ticket modal opens
  useEffect(() => {
    if (showTicketModal) {
      const loadCategories = async () => {
        try {
          setLoadingCategories(true);
          const categoriesData = await categoriesApi.getAll();
          setCategories(categoriesData);
          
          // If a category is already selected, load its subcategories
          if (ticketData.category_id) {
            const subCategoriesData = await subCategoriesApi.getByCategoryId(ticketData.category_id);
            setSubCategories(subCategoriesData);
          }
        } catch (error) {
          console.error('Failed to load categories:', error);
        } finally {
          setLoadingCategories(false);
        }
      };
      loadCategories();
    }
  }, [showTicketModal]);

  // Load subcategories when category changes
  useEffect(() => {
    if (ticketData.category_id && showTicketModal) {
      const loadSubCategories = async () => {
        try {
          const subCategoriesData = await subCategoriesApi.getByCategoryId(ticketData.category_id!);
          setSubCategories(subCategoriesData);
          // Auto-select first subcategory if none selected and category changed
          if (!ticketData.subcategory_id && subCategoriesData.length > 0) {
            setTicketData(prev => ({ ...prev, subcategory_id: subCategoriesData[0].id }));
          } else if (!ticketData.subcategory_id) {
            // Reset subcategory when category changes if no subcategories available
            setTicketData(prev => ({ ...prev, subcategory_id: undefined }));
          }
        } catch (error) {
          console.error('Failed to load subcategories:', error);
          setSubCategories([]);
        }
      };
      loadSubCategories();
    } else if (!ticketData.category_id) {
      setSubCategories([]);
    }
  }, [ticketData.category_id, showTicketModal]);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Knowledge Base Chat</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get instant answers from our knowledge base using AI
            </p>
          </div>
          <Button
            color="blue"
            size="sm"
            onClick={() => router.push('/knowledge-base/analytics')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-180px)] max-h-[calc(100vh-180px)]">
          
          {/* Sidebar - Chat Sessions */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border p-4 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Chat Sessions</h2>
              <Button size="sm" onClick={handleStartNewChat}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {sessionsLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2">
                {sessions.map((session) => (
                  <Card
                    key={session.id}
                    className={`cursor-pointer transition-colors ${
                      currentSessionId === session.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleSessionSelect(session.id)}
                  >
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-sm truncate flex-1 mr-2">
                          {session.title}
                        </h3>
                        <Button
                          size="xs"
                          color="gray"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="text-xs text-gray-500 mb-2">
                        {session.message_count} messages
                      </div>
                      
                      {session.topics_discussed.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {session.topics_discussed.slice(0, 3).map((topic, idx) => (
                            <Badge key={idx} color="blue" size="sm">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {new Date(session.updated_at).toLocaleDateString()}
                        </span>
                        {session.satisfaction_rating && (
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs ml-1">{session.satisfaction_rating}</span>
                          </div>
                        )}
                      </div>
                      
                      {session.converted_to_ticket && (
                        <Badge color="green" size="sm" className="mt-2">
                          Converted to Ticket
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}
                
                {sessions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No chat sessions yet.</p>
                    <p className="text-sm">Start a new chat to begin!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3 flex flex-col">
            {currentSessionId ? (
              <>
                {/* Chat Header */}
                <div className="border-b p-4 bg-white rounded-t-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-lg font-semibold text-gray-900">
                        {currentSession?.title || 'Knowledge Base Chat'}
                      </h1>
                      <p className="text-sm text-gray-600">
                        Ask questions about our knowledge base articles
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Tooltip content="Rate this chat session">
                        <Button
                          size="sm"
                          color="gray"
                          onClick={() => setShowRatingModal(true)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                      
                      <Tooltip content="Convert to support ticket - Create a ticket if your issue wasn't resolved">
                        <Button
                          size="sm"
                          color={currentSession?.converted_to_ticket ? "success" : "blue"}
                          onClick={() => setShowTicketModal(true)}
                          disabled={currentSession?.converted_to_ticket}
                        >
                          <Ticket className="h-4 w-4 mr-1" />
                          {currentSession?.converted_to_ticket ? 'Converted' : 'Create Ticket'}
                        </Button>
                      </Tooltip>
                    </div>
                  </div>
                </div>

                {/* Chat Interface Component */}
                <div className="flex-1 min-h-0 flex flex-col">
                  <ChatInterface
                    messages={messages}
                    loading={messageLoading || messagesLoading}
                    onSendMessage={handleSendMessage}
                    placeholder="Ask a question about our knowledge base..."
                    disabled={messageLoading}
                    showSources={true}
                    emptyStateMessage="Start a conversation! Ask me anything about our knowledge base."
                    emptyStateSubtext='Try asking: "How do I reset my password?" or "Tell me about billing policies"'
                  />
                  
                  {/* Suggestion to create ticket if issue not resolved */}
                  {messages.length > 2 && 
                   !currentSession?.converted_to_ticket && 
                   messages[messages.length - 1]?.message_type === 'assistant' && (
                    <div className="border-t bg-blue-50 p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900 mb-1">
                            Issue not resolved?
                          </p>
                          <p className="text-sm text-blue-700 mb-3">
                            If the chat didn&apos;t solve your problem, you can create a support ticket and our team will help you further.
                          </p>
                          <Button
                            size="sm"
                            color="blue"
                            onClick={() => setShowTicketModal(true)}
                          >
                            <Ticket className="h-4 w-4 mr-1" />
                            Create Support Ticket
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-white rounded-lg shadow-sm border">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Knowledge Base Chat
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Get instant answers from our knowledge base using AI
                  </p>
                  <Button onClick={handleStartNewChat}>
                    Start New Chat
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <Modal show={showRatingModal} onClose={() => setShowRatingModal(false)}>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Rate This Chat Session</h3>
          <div className="text-center">
            <p className="mb-4">How helpful was this chat session?</p>
            <div className="flex justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setSessionRating(value)}
                  className={`p-1 transition-colors ${
                    value <= sessionRating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  <Star className={`h-6 w-6 ${value <= sessionRating ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={handleRateSession} disabled={sessionRating === 0}>
              Submit Rating
            </Button>
            <Button color="gray" onClick={() => setShowRatingModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Ticket Conversion Modal */}
      <Modal show={showTicketModal} onClose={() => setShowTicketModal(false)} size="lg">
        <ModalHeader>Convert Chat to Support Ticket</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Creating a ticket from this chat</p>
                <p>The entire chat history will be included in the ticket description to help our support team understand your issue.</p>
              </div>
            </div>

            <div>
              <Label htmlFor="ticket-title" className="mb-2">
                Ticket Title <span className="text-red-500">*</span>
              </Label>
              <TextInput
                id="ticket-title"
                value={ticketData.title}
                onChange={(e) => setTicketData({ ...ticketData, title: e.target.value })}
                placeholder="Brief description of the issue"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="ticket-description" className="mb-2">
                Additional Description
              </Label>
              <textarea
                id="ticket-description"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                value={ticketData.description}
                onChange={(e) => setTicketData({ ...ticketData, description: e.target.value })}
                placeholder="Any additional details or context..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ticket-category" className="mb-2">
                  Category <span className="text-red-500">*</span>
                </Label>
                {loadingCategories ? (
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" />
                    <span className="text-sm text-gray-500">Loading categories...</span>
                  </div>
                ) : (
                  <Select
                    id="ticket-category"
                    value={ticketData.category_id || ''}
                    onChange={(e) => setTicketData({ ...ticketData, category_id: e.target.value })}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                )}
              </div>

              <div>
                <Label htmlFor="ticket-subcategory" className="mb-2">
                  Subcategory <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="ticket-subcategory"
                  value={ticketData.subcategory_id || ''}
                  onChange={(e) => setTicketData({ ...ticketData, subcategory_id: e.target.value })}
                  disabled={!ticketData.category_id || subCategories.length === 0}
                  required
                >
                  <option value="">
                    {!ticketData.category_id 
                      ? 'Select category first' 
                      : subCategories.length === 0 
                        ? 'No subcategories available' 
                        : 'Select a subcategory'}
                  </option>
                  {subCategories.map((subCategory) => (
                    <option key={subCategory.id} value={subCategory.id}>
                      {subCategory.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="ticket-priority" className="mb-2">
                Priority
              </Label>
              <Select
                id="ticket-priority"
                value={ticketData.priority}
                onChange={(e) => setTicketData({ ...ticketData, priority: e.target.value as typeof ticketData.priority })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button 
              onClick={handleConvertToTicket} 
              disabled={!ticketData.title.trim() || !ticketData.category_id || !ticketData.subcategory_id}
            >
              Create Ticket
            </Button>
            <Button color="gray" onClick={() => setShowTicketModal(false)}>
              Cancel
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
}
