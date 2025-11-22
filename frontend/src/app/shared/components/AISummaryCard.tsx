'use client';

import { Button, Alert } from 'flowbite-react';
import { Brain, Sparkles, RefreshCw, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatFullDateTime } from '../../../lib/utils';

export interface AISummaryCardProps {
  summary: string | null;
  generatingSummary: boolean;
  isRefreshingSummary: boolean;
  summaryGeneratedAt: string | null;
  showSummary: boolean;
  summaryError: string | null;
  onGenerate: () => void;
  onRefresh: () => void;
  onToggleVisibility: () => void;
  onDismissError: () => void;
}

export function AISummaryCard({
  summary,
  generatingSummary,
  isRefreshingSummary,
  summaryGeneratedAt,
  showSummary,
  summaryError,
  onGenerate,
  onRefresh,
  onToggleVisibility,
  onDismissError,
}: AISummaryCardProps) {
  return (
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
                onClick={onRefresh}
                disabled={generatingSummary || isRefreshingSummary}
                title="Refresh summary"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshingSummary ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                size="sm"
                color="gray"
                onClick={onToggleVisibility}
                title={showSummary ? 'Hide summary' : 'Show summary'}
              >
                {showSummary ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </>
          )}
          <Button
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
            onClick={onGenerate}
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
        <Alert color="failure" className="mb-4" onDismiss={onDismissError}>
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
                onClick={onRefresh}
                disabled={isRefreshingSummary}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshingSummary ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                size="xs"
                color="gray"
                onClick={onToggleVisibility}
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
            onClick={onToggleVisibility}
          >
            <Eye className="h-3 w-3 mr-1" />
            Show Summary
          </Button>
        </div>
      )}
    </div>
  );
}

