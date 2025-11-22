'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Breadcrumb, BreadcrumbItem, Button, Avatar, Textarea, Alert } from 'flowbite-react';
import { MessageCircle, AlertCircle, Edit3, CheckCircle2, XCircle, Home, Brain, Sparkles, RefreshCw, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { MainLayout, ProtectedRoute } from '../../../src/app/shared/components';
import { LoadingSpinner } from '../../../src/app/shared/components';
import { RichTextEditor } from '../../../src/app/shared/components/RichTextEditor';
import { ticketsApi } from '../../../src/lib/api';
import { formatFullDateTime } from '../../../src/lib/utils';
import { useAuth } from '../../../src/contexts/AuthContext';
import type { Ticket, Comment, CreateComment, RichTextContent, TicketStatus } from '../../../src/app/shared/types';
import { createEmptyRichText, convertLegacyContent } from '../../../src/lib/utils';

export default function TicketDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState<RichTextContent>(createEmptyRichText());
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // Status management states
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showCloseForm, setShowCloseForm] = useState(false);
  const [closingComment, setClosingComment] = useState('');

  // ENHANCEMENT L1 AI TICKET SUMMARY - AI summary state management
  const [summary, setSummary] = useState<string | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryGeneratedAt, setSummaryGeneratedAt] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isRefreshingSummary, setIsRefreshingSummary] = useState(false);

  const fetchTicketData = useCallback(async () => {
    if (!ticketId) return;

    try {
      setLoading(true);
      const [ticketData, commentsData] = await Promise.all([
        ticketsApi.getById(ticketId),
        ticketsApi.getComments(ticketId),
      ]);
      setTicket(ticketData);
      setComments(commentsData);
      
      // ENHANCEMENT L1 AI TICKET SUMMARY - Initialize summary state from ticket data
      if (ticketData.aiSummary) {
        setSummary(ticketData.aiSummary);
        setSummaryGeneratedAt(ticketData.summaryGeneratedAt || null);
        setShowSummary(true);
        setSummaryError(null); // Clear any previous errors
      } else {
        // Reset summary state if ticket doesn't have one
        setSummary(null);
        setSummaryGeneratedAt(null);
        setShowSummary(false);
      }
    } catch (error) {
      console.error('Failed to fetch ticket data:', error);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (ticketId) {
      fetchTicketData();
    }
  }, [ticketId, fetchTicketData]);

  const handleAddComment = async () => {
    if (!ticketId || !newComment.text.trim()) return;

    try {
      setSubmittingComment(true);
      const commentData: CreateComment = {
        content: newComment,
      };
      
      const newCommentData = await ticketsApi.createComment(ticketId, commentData);
      setComments([...comments, newCommentData]);
      setNewComment(createEmptyRichText());
      
      // Refresh ticket data to get updated status if it changed
      // (e.g., when user responds to a ticket that was waiting for customer)
      const updatedTicket = await ticketsApi.getById(ticketId);
      setTicket(updatedTicket);
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusUpdate = async (newStatus: TicketStatus) => {
    if (!ticketId || !ticket) return;

    try {
      setUpdatingStatus(true);
      await ticketsApi.updateStatus(ticketId, newStatus);
      
      // Update local ticket state
      setTicket({ ...ticket, status: newStatus });
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!ticketId || !ticket || !closingComment.trim()) return;

    try {
      setUpdatingStatus(true);
      
      // Add closing comment first
      const commentData: CreateComment = {
        content: {
          html: `<p>${closingComment}</p>`,
          json: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: closingComment }]
              }
            ]
          },
          text: closingComment
        }
      };
      
      const newCommentData = await ticketsApi.createComment(ticketId, commentData);
      setComments([...comments, newCommentData]);
      
      // Then close the ticket
      await ticketsApi.updateStatus(ticketId, 'closed');
      setTicket({ ...ticket, status: 'closed' });
      
      // Reset form
      setClosingComment('');
      setShowCloseForm(false);
    } catch (error) {
      console.error('Failed to close ticket:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Check if current user can modify this ticket (agent assigned to it)
  const canModifyTicket = user?.role === 'agent' && ticket?.agentInfo?.id === user.id;

  // ENHANCEMENT L1 AI TICKET SUMMARY - Generate summary function
  const handleGenerateSummary = async (isRefresh = false) => {
    if (!ticketId) return;

    try {
      // Clear previous errors
      setSummaryError(null);
      
      // Set appropriate loading state
      if (isRefresh) {
        setIsRefreshingSummary(true);
      } else {
        setGeneratingSummary(true);
      }

      const response = await ticketsApi.generateSummary(ticketId);
      
      // Update summary data
      setSummary(response.summary);
      setSummaryGeneratedAt(new Date().toISOString());
      setShowSummary(true);
      
      // Update ticket data to reflect the new summary
      const updatedTicket = await ticketsApi.getById(ticketId);
      setTicket(updatedTicket);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      
      // Extract error message
      let errorMessage = 'Failed to generate summary. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      // Provide more specific error messages
      if (errorMessage.includes('401') || errorMessage.includes('403')) {
        errorMessage = 'You do not have permission to generate summaries.';
      } else if (errorMessage.includes('500') || errorMessage.includes('503')) {
        errorMessage = 'AI service is temporarily unavailable. Please try again later.';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setSummaryError(errorMessage);
    } finally {
      setGeneratingSummary(false);
      setIsRefreshingSummary(false);
    }
  };

  // Handle summary refresh
  const handleRefreshSummary = async () => {
    await handleGenerateSummary(true);
  };

  // Toggle summary visibility
  const toggleSummaryVisibility = () => {
    setShowSummary(!showSummary);
  };
  


  if (loading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex justify-center items-center min-h-screen">
            <LoadingSpinner text="Loading ticket..." />
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  if (!ticket) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Ticket not found</h3>
                <p className="text-sm">The requested ticket could not be loaded.</p>
                <Link href="/tickets">
                  <Button className="mt-4 bg-orange-600 hover:bg-orange-700 focus:ring-orange-500">
                    Go Back
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Breadcrumbs */}
          <Breadcrumb aria-label="Ticket breadcrumb" className="mb-6">
            <BreadcrumbItem>
              <Link href="/" className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <Link href="/tickets" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                {user?.role === 'agent' ? 'Agent Dashboard' : 'My Tickets'}
              </Link>
            </BreadcrumbItem>
            <BreadcrumbItem>
              Ticket #{ticketId}
            </BreadcrumbItem>
          </Breadcrumb>

          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {ticket.title}
                </h1>
                <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                  <span>#{ticketId}</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>Created by {ticket.userInfo?.name || ticket.userInfo?.email}</span>
                  {ticket.agentInfo && (
                    <>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>Assigned to {ticket.agentInfo.name || ticket.agentInfo.email}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Status Workflow */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
                <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Ticket Progress
                  </h3>
                </div>
                <div className="p-6">
                  <div className="relative">
                    {/* Progress Steps */}
                    <div className="flex items-center justify-between relative mb-8">
                      {[
                        { status: 'new', label: 'New' },
                        { status: 'in_progress', label: 'In Progress' },
                        { status: 'waiting_for_customer', label: 'Awaiting Customer' },
                        { status: 'waiting_for_agent', label: 'Awaiting Agent' },
                        { status: 'resolved', label: 'Resolved' },
                        { status: 'closed', label: 'Closed' }
                      ].map((step, index, array) => {
                        const currentIndex = array.findIndex(s => s.status === ticket.status);
                        const isCompleted = index < currentIndex;
                        const isCurrent = step.status === ticket.status;
                        
                        return (
                          <div key={step.status} className="flex flex-col items-center relative z-10">
                            {/* Step Circle */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                              isCompleted 
                                ? 'bg-blue-600 border-blue-600 text-white' 
                                : isCurrent
                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                                : 'bg-white border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-600'
                            }`}>
                              {isCompleted ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <span className="text-xs font-bold">{index + 1}</span>
                              )}
                            </div>
                            
                            {/* Step Label */}
                            <div className={`mt-2 text-xs font-medium text-center max-w-20 ${
                              isCompleted || isCurrent 
                                ? 'text-blue-600 dark:text-blue-400' 
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {step.label}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Progress Line */}
                      <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 dark:bg-gray-700 -z-0">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-500 ease-out"
                          style={{
                            width: `${(([
                              'new', 'in_progress', 'waiting_for_customer', 'waiting_for_agent', 'resolved', 'closed'
                            ].findIndex(s => s === ticket.status)) / 5) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 text-center bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                    <span className="font-medium">Current Status:</span>{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {ticket.status === 'new' ? 'New Ticket - Awaiting Assignment' :
                       ticket.status === 'in_progress' ? 'In Progress - Being Worked On' :
                       ticket.status === 'waiting_for_customer' ? 'Waiting for Your Response' :
                       ticket.status === 'waiting_for_agent' ? 'Waiting for Agent Response' :
                       ticket.status === 'resolved' ? 'Resolved - Ready for Review' :
                       ticket.status === 'closed' ? 'Closed - Completed' : ticket.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ticket Details Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                {/* Status and Priority Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">STATUS</div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        ticket.status === 'new' ? 'bg-blue-500' :
                        ticket.status === 'in_progress' ? 'bg-yellow-500' :
                        ticket.status === 'waiting_for_customer' ? 'bg-orange-500' :
                        ticket.status === 'waiting_for_agent' ? 'bg-purple-500' :
                        ticket.status === 'resolved' ? 'bg-green-500' :
                        ticket.status === 'closed' ? 'bg-gray-500' : 'bg-gray-400'
                      }`}></div>
                      <span className={`text-sm font-medium ${
                        ticket.status === 'new' ? 'text-blue-700 dark:text-blue-300' :
                        ticket.status === 'in_progress' ? 'text-yellow-700 dark:text-yellow-300' :
                        ticket.status === 'waiting_for_customer' ? 'text-orange-700 dark:text-orange-300' :
                        ticket.status === 'waiting_for_agent' ? 'text-purple-700 dark:text-purple-300' :
                        ticket.status === 'resolved' ? 'text-green-700 dark:text-green-300' :
                        ticket.status === 'closed' ? 'text-gray-700 dark:text-gray-300' : 'text-gray-600'
                      }`}>
                        {ticket.status === 'new' ? 'New' :
                         ticket.status === 'in_progress' ? 'In Progress' :
                         ticket.status === 'waiting_for_customer' ? 'Waiting for Customer' :
                         ticket.status === 'waiting_for_agent' ? 'Waiting for Agent' :
                         ticket.status === 'resolved' ? 'Resolved' :
                         ticket.status === 'closed' ? 'Closed' : ticket.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">PRIORITY</div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        ticket.priority === 'critical' ? 'bg-red-500' :
                        ticket.priority === 'high' ? 'bg-orange-500' :
                        ticket.priority === 'medium' ? 'bg-yellow-500' :
                        ticket.priority === 'low' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      <span className={`text-sm font-medium ${
                        ticket.priority === 'critical' ? 'text-red-700 dark:text-red-300' :
                        ticket.priority === 'high' ? 'text-orange-700 dark:text-orange-300' :
                        ticket.priority === 'medium' ? 'text-yellow-700 dark:text-yellow-300' :
                        ticket.priority === 'low' ? 'text-green-700 dark:text-green-300' : 'text-gray-600'
                      }`}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>



                {/* ENHANCEMENT L1 AI TICKET SUMMARY - AI Summary section for agents */}
                {user?.role === 'agent' && ticket.status !== 'closed' && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <h4 className="text-sm font-medium text-purple-900 dark:text-purple-200">
                          AI Ticket Summary
                        </h4>
                        {summary && (
                          <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded-full">
                            Available
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {summary && (
                          <>
                            <Button
                              size="sm"
                              color="gray"
                              onClick={handleRefreshSummary}
                              disabled={generatingSummary || isRefreshingSummary}
                              title="Refresh summary"
                            >
                              <RefreshCw className={`h-4 w-4 ${isRefreshingSummary ? 'animate-spin' : ''}`} />
                            </Button>
                            <Button
                              size="sm"
                              color="gray"
                              onClick={toggleSummaryVisibility}
                              title={showSummary ? 'Hide summary' : 'Show summary'}
                            >
                              {showSummary ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
                          onClick={() => handleGenerateSummary(false)}
                          disabled={generatingSummary || isRefreshingSummary}
                        >
                          {generatingSummary || isRefreshingSummary ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              {summary ? 'Regenerate Summary' : 'Generate Summary'}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Error state */}
                    {summaryError && (
                      <Alert color="failure" className="mb-4" onDismiss={() => setSummaryError(null)}>
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 mr-2" />
                          <div>
                            <div className="font-medium">Summary Generation Failed</div>
                            <div className="text-sm mt-1">{summaryError}</div>
                          </div>
                        </div>
                      </Alert>
                    )}

                    {/* Loading state - Initial generation */}
                    {generatingSummary && !summary && (
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
                        <span className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                          AI is analyzing the ticket conversation...
                        </span>
                        <span className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                          This may take a few moments
                        </span>
                      </div>
                    )}

                    {/* Loading state - Refreshing existing summary */}
                    {isRefreshingSummary && summary && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700 p-4 opacity-75">
                        <div className="flex items-center justify-center py-4">
                          <RefreshCw className="h-5 w-5 animate-spin text-purple-600 mr-2" />
                          <span className="text-sm text-purple-700 dark:text-purple-300">
                            Refreshing summary...
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Summary display */}
                    {showSummary && summary && !generatingSummary && !isRefreshingSummary && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700 p-4 transition-opacity duration-300">
                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
                              Summary Generated
                            </h5>
                          </div>
                          {summaryGeneratedAt && (
                            <div className="flex flex-col items-end">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Generated
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-300">
                                {formatFullDateTime(summaryGeneratedAt)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {summary}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {summary.split(' ').length} words • {summary.length} characters
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="xs"
                              color="gray"
                              onClick={handleRefreshSummary}
                              disabled={isRefreshingSummary}
                            >
                              <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshingSummary ? 'animate-spin' : ''}`} />
                              Refresh
                            </Button>
                            <Button
                              size="xs"
                              color="gray"
                              onClick={toggleSummaryVisibility}
                            >
                              <EyeOff className="h-3 w-3 mr-1" />
                              Hide
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Hidden summary indicator */}
                    {summary && !showSummary && !generatingSummary && !isRefreshingSummary && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700 p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Brain className="h-4 w-4 text-purple-600" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Summary is available but hidden
                          </span>
                        </div>
                        <Button
                          size="xs"
                          color="gray"
                          onClick={toggleSummaryVisibility}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Show Summary
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Description</h4>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <RichTextEditor
                      content={convertLegacyContent(ticket.content)}
                      editable={false}
                      className="border-none bg-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                {/* Comments Header */}
                <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Activity & Comments
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">({comments.length})</span>
                  </div>
                </div>
                
                {/* Comments List */}
                <div className="px-6 py-4">
                  <div className="space-y-6 mb-8">
                    {comments.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No comments yet</p>
                        <p className="text-sm">Be the first to add a comment!</p>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="flex space-x-4 pb-6 border-b border-gray-100 dark:border-gray-700 last:border-b-0 last:pb-0">
                          <Avatar
                            img=""
                            alt={comment.user.name || comment.user.email}
                            size="md"
                            className="flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {comment.user.name || comment.user.email}
                              </span>
                              {comment.user.role && (
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  comment.user.role === 'agent' 
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                }`}>
                                  {comment.user.role === 'agent' ? 'Agent' : 'Customer'}
                                </span>
                              )}
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {formatFullDateTime(comment.createdAt)}
                              </span>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                              <RichTextEditor
                                content={convertLegacyContent(comment.content)}
                                editable={false}
                                className="border-none bg-transparent"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Comment Form */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex space-x-4">
                      <Avatar
                        img=""
                        alt="You"
                        size="md"
                        className="flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Add a comment
                        </label>
                        <div className="mb-4">
                          <RichTextEditor
                            content={newComment}
                            onChange={setNewComment}
                            placeholder="Type your comment here..."
                            className="min-h-[140px] border-2 border-gray-200 dark:border-gray-600 rounded-lg"
                          />
                        </div>
                        <div className="flex justify-end space-x-3">
                          <Button
                            color="gray"
                            onClick={() => setNewComment(createEmptyRichText())}
                            disabled={!newComment.text.trim()}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
                            onClick={handleAddComment}
                            disabled={!newComment.text.trim() || submittingComment}
                          >
                            {submittingComment ? 'Adding...' : 'Add Comment'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Sidebar */}
            <div className="space-y-6">
              {/* Action Buttons Card */}
              {canModifyTicket && ticket.status !== 'closed' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Actions
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {ticket.status === 'new' && (
                      <Button
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 justify-start"
                        onClick={() => handleStatusUpdate('in_progress')}
                        disabled={updatingStatus}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Start Work
                      </Button>
                    )}
                    
                    {ticket.status === 'in_progress' && (
                      <>
                        <Button
                          size="sm"
                          className="w-full bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 justify-start"
                          onClick={() => handleStatusUpdate('waiting_for_customer')}
                          disabled={updatingStatus}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Wait for Customer
                        </Button>
                        <Button
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700 focus:ring-green-500 justify-start"
                          onClick={() => handleStatusUpdate('resolved')}
                          disabled={updatingStatus}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Mark Resolved
                        </Button>
                      </>
                    )}
                    
                    {(ticket.status === 'waiting_for_customer' || ticket.status === 'waiting_for_agent') && (
                      <Button
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 justify-start"
                        onClick={() => handleStatusUpdate('in_progress')}
                        disabled={updatingStatus}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Resume Work
                      </Button>
                    )}

                    {(ticket.status === 'in_progress' || ticket.status === 'resolved') && (
                      <Button
                        size="sm"
                        className="w-full bg-red-600 hover:bg-red-700 focus:ring-red-500 justify-start"
                        onClick={() => setShowCloseForm(!showCloseForm)}
                        disabled={updatingStatus}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Close Ticket
                      </Button>
                    )}
                  </div>

                  {/* Close Ticket Form */}
                  {showCloseForm && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Closing Comment <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        value={closingComment}
                        onChange={(e) => setClosingComment(e.target.value)}
                        placeholder="Describe how the issue was resolved..."
                        rows={3}
                        className="w-full mb-3"
                        required
                      />
                      <div className="flex flex-col space-y-2">
                        <Button
                          size="sm"
                          className="w-full bg-red-600 hover:bg-red-700 focus:ring-red-500"
                          onClick={handleCloseTicket}
                          disabled={!closingComment.trim() || updatingStatus}
                        >
                          {updatingStatus ? 'Closing...' : 'Close Ticket'}
                        </Button>
                        <Button
                          size="sm"
                          color="gray"
                          className="w-full"
                          onClick={() => {
                            setShowCloseForm(false);
                            setClosingComment('');
                          }}
                          disabled={updatingStatus}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Ticket Info Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Details
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-4 text-sm">
                    <div>
                      <dt className="font-medium text-gray-500 dark:text-gray-400 mb-1">Created</dt>
                      <dd className="text-gray-900 dark:text-white">
                        {formatFullDateTime(ticket.createdAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500 dark:text-gray-400 mb-1">Updated</dt>
                      <dd className="text-gray-900 dark:text-white">
                        {formatFullDateTime(ticket.updatedAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500 dark:text-gray-400 mb-1">Reporter</dt>
                      <dd className="text-gray-900 dark:text-white">
                        {ticket.userInfo?.name || ticket.userInfo?.email}
                      </dd>
                    </div>
                    {ticket.agentInfo && (
                      <div>
                        <dt className="font-medium text-gray-500 dark:text-gray-400 mb-1">Assigned to</dt>
                        <dd className="text-gray-900 dark:text-white">
                          {ticket.agentInfo.name || ticket.agentInfo.email}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="font-medium text-gray-500 dark:text-gray-400 mb-1">Category</dt>
                      <dd className="text-gray-900 dark:text-white">
                        {ticket.category?.name} → {ticket.subCategory?.name}
                      </dd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}