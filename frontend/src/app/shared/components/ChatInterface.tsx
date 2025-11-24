'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Button, TextInput, Spinner, Badge } from 'flowbite-react';
import { Send, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { ChatMessage } from '../../../../types/chat';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  loading?: boolean;
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showSources?: boolean;
  emptyStateMessage?: string;
  emptyStateSubtext?: string;
}

/**
 * Reusable chat interface component for displaying messages and handling user input
 * 
 * Features:
 * - Auto-scroll to latest message
 * - Loading indicator
 * - Source citations display
 * - Keyboard shortcuts (Enter to send)
 * - Responsive design
 */
export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  loading = false,
  onSendMessage,
  placeholder = 'Type your message...',
  disabled = false,
  showSources = true,
  emptyStateMessage = 'Start a conversation!',
  emptyStateSubtext = 'Ask me anything...',
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage || loading || disabled) return;

    onSendMessage(trimmedMessage);
    setInputMessage('');
    
    // Focus back on input after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2 text-lg">{emptyStateMessage}</p>
            <p className="text-sm text-gray-400">{emptyStateSubtext}</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.message_type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl p-3 rounded-lg ${
                msg.message_type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{msg.message}</p>

              {/* Source citations */}
              {showSources && msg.sources && msg.sources.length > 0 && (
                <div
                  className={`mt-3 pt-3 border-t ${
                    msg.message_type === 'user'
                      ? 'border-blue-400'
                      : 'border-gray-300'
                  }`}
                >
                  <p
                    className={`text-sm font-medium mb-2 ${
                      msg.message_type === 'user'
                        ? 'text-blue-100'
                        : 'text-gray-700'
                    }`}
                  >
                    Sources:
                  </p>
                  <div className="space-y-2">
                    {msg.sources.map((source, idx) => {
                      const articleId = (source as { article_id?: string; id?: string; url?: string }).article_id || source.id || (source.url?.split('/').pop() || '');
                      return (
                        <div
                          key={articleId || idx}
                          className={`p-2 rounded border text-sm ${
                            msg.message_type === 'user'
                              ? 'bg-blue-500 border-blue-400 text-white'
                              : 'bg-white border-gray-200 text-gray-900'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            {articleId ? (
                              <Link
                                href={`/knowledge-base/${articleId}`}
                                className={`font-medium hover:underline flex items-center ${
                                  msg.message_type === 'user'
                                    ? 'text-blue-100 hover:text-blue-50'
                                    : 'text-blue-600 hover:text-blue-800'
                                }`}
                              >
                                {source.title}
                                <ExternalLink className="inline h-3 w-3 ml-1" />
                              </Link>
                            ) : (
                              <span
                                className={`font-medium ${
                                  msg.message_type === 'user'
                                    ? 'text-blue-100'
                                    : 'text-gray-700'
                                }`}
                              >
                                {source.title}
                              </span>
                            )}
                            <Badge
                              size="sm"
                              color={msg.message_type === 'user' ? 'blue' : 'blue'}
                              className="ml-2"
                            >
                              {Math.round((source.relevance || 0.8) * 100)}% match
                            </Badge>
                          </div>
                          <p
                            className={
                              msg.message_type === 'user'
                                ? 'text-blue-50'
                                : 'text-gray-600'
                            }
                          >
                            {source.excerpt}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div
                className={`text-xs mt-2 ${
                  msg.message_type === 'user'
                    ? 'text-blue-200'
                    : 'text-gray-500'
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg flex items-center">
              <Spinner size="sm" className="mr-2" />
              <span className="text-sm text-gray-600">Thinking...</span>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-gray-50">
        <div className="flex gap-3">
          <TextInput
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1"
            disabled={loading || disabled}
            autoFocus
          />
          <Button
            onClick={handleSend}
            disabled={!inputMessage.trim() || loading || disabled}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

