'use client';

import { useEffect, useState } from 'react';
import { MainLayout, ProtectedRoute } from '../../../src/app/shared/components';
import { Card, Button, Select, Spinner, Badge } from 'flowbite-react';
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Star, 
  Clock, 
  FileText, 
  Ticket,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { kbChatApi } from '../../../src/lib/api/kb-chat';
import { useAuth } from '../../../src/contexts/AuthContext';
import type { ChatAnalytics } from '../../../types/chat';

export default function ChatAnalyticsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState<ChatAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const fetchAnalytics = async () => {
    // Don't fetch if not authenticated yet
    if (!isAuthenticated || authLoading) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await kbChatApi.getAnalytics(days);
      setAnalytics(data);
    } catch (err: unknown) {
      console.error('Failed to fetch analytics:', err);
      // Check if it's an axios error with 401 status
      const axiosError = err as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        // Don't set error message for 401 - let ProtectedRoute handle it
        setError('Authentication required. Please log in again.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchAnalytics();
    }
  }, [days, isAuthenticated, authLoading]);

  if (loading && !analytics) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner size="xl" />
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">Error: {error}</p>
              <Button onClick={fetchAnalytics} color="red" className="mt-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  if (!analytics) {
    return null;
  }

  const { summary, top_articles, sessions_trend, top_topics } = analytics;

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Chat Analytics Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Insights into your knowledge base chat usage
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-32"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={365}>Last year</option>
              </Select>
              <Button onClick={fetchAnalytics} color="gray" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Sessions
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {summary.total_sessions}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Messages
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {summary.total_messages}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Conversion Rate
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {summary.conversion_rate.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Avg Satisfaction
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {summary.avg_satisfaction_rating > 0 
                      ? summary.avg_satisfaction_rating.toFixed(1) 
                      : 'N/A'}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
                </div>
              </div>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Session Metrics
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active Sessions</span>
                  <span className="font-medium">{summary.active_sessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Messages/Session</span>
                  <span className="font-medium">{summary.avg_messages_per_session.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Duration</span>
                  <span className="font-medium">
                    {summary.avg_session_duration_minutes > 0
                      ? `${summary.avg_session_duration_minutes.toFixed(1)} min`
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Converted to Tickets</span>
                  <span className="font-medium">{summary.converted_sessions}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Message Breakdown
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">User Messages</span>
                  <Badge color="blue">{summary.user_messages}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Assistant Messages</span>
                  <Badge color="green">{summary.assistant_messages}</Badge>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Message Ratio
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(summary.user_messages / summary.total_messages) * 100}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>User</span>
                    <span>Assistant</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Ticket className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Conversion Stats
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</span>
                  <span className="font-medium">{summary.total_sessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Converted</span>
                  <Badge color="purple">{summary.converted_sessions}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Not Converted</span>
                  <span className="font-medium">
                    {summary.total_sessions - summary.converted_sessions}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Conversion Progress
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${summary.conversion_rate}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sessions Trend Chart */}
          {sessions_trend.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sessions Over Time
                </h3>
              </div>
              <div className="h-64 flex items-end gap-2">
                {sessions_trend.map((item, index) => {
                  const maxCount = Math.max(...sessions_trend.map(t => t.count), 1);
                  const height = (item.count / maxCount) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-600 dark:bg-blue-500 rounded-t transition-all hover:bg-blue-700 dark:hover:bg-blue-400"
                        style={{ height: `${height}%` }}
                        title={`${item.date}: ${item.count} sessions`}
                      />
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Top Articles and Topics */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Top Articles */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Most Referenced Articles
                </h3>
              </div>
              {top_articles.length > 0 ? (
                <div className="space-y-3">
                  {top_articles.map((article, index) => (
                    <div
                      key={article.article_id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            #{index + 1}
                          </span>
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {article.title}
                          </p>
                        </div>
                      </div>
                      <Badge color="blue">{article.reference_count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No articles referenced yet
                </p>
              )}
            </Card>

            {/* Top Topics */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Top Topics Discussed
                </h3>
              </div>
              {top_topics.length > 0 ? (
                <div className="space-y-3">
                  {top_topics.map((topic, index) => (
                    <div
                      key={topic.topic}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          #{index + 1}
                        </span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {topic.topic}
                        </p>
                      </div>
                      <Badge color="green">{topic.count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No topics tracked yet
                </p>
              )}
            </Card>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}

