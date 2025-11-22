'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Card, Table, TableHead, TableHeadCell, TableRow, TableCell, TableBody, Pagination, Badge, Alert } from 'flowbite-react';
import { Plus, BookOpen, Calendar, Filter, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainLayout, ProtectedRoute, SearchBar } from '../../src/app/shared/components';
import { LoadingSpinner } from '../../src/app/shared/components';
import { articlesApi } from '../../src/lib/api';
import { formatFullDateTime, highlightSearchTerm, truncateAroundSearchTerm, getRichTextDisplay } from '../../src/lib/utils';
import { useAuth } from '../../src/contexts/AuthContext';
import { useDebounceSearch } from '../../src/app/shared/hooks/useDebounceSearch';
import { useSearchHistory } from '../../src/app/shared/hooks/useSearchHistory';
import type { Article } from '../../src/app/shared/types';

const ITEMS_PER_PAGE = 10;

export default function KnowledgeBasePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  // Search functionality
  const searchFn = useCallback(async (query: string) => {
    const params: { q: string; categoryId?: string } = { q: query };
    if (categoryFilter) {
      params.categoryId = categoryFilter;
    }
    return await articlesApi.search(params);
  }, [categoryFilter]);

  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    results: searchResults,
    loading: searchLoading,
    error: searchError,
    clearSearch,
    isSearching,
  } = useDebounceSearch<Article>(searchFn);

  const { history: searchHistory, addToHistory } = useSearchHistory('kb-search-history');

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await articlesApi.getAll();
      setArticles(data);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Save successful searches to history
  useEffect(() => {
    if (searchQuery && searchResults.length > 0) {
      addToHistory(searchQuery);
    }
  }, [searchQuery, searchResults.length, addToHistory]);

  const handleArticleClick = (articleId: string) => {
    router.push(`/knowledge-base/${articleId}`);
  };

  const handleRecentSearchClick = (search: string) => {
    setSearchQuery(search);
  };

  const handleClearFilters = () => {
    setCategoryFilter(null);
    clearSearch();
    setCurrentPage(1);
  };

  // Determine which articles to display
  const displayArticles = isSearching ? searchResults : articles;

  // Apply pagination
  const totalPages = Math.ceil(displayArticles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedArticles = displayArticles.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter]);

  if (loading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <LoadingSpinner text="Loading knowledge base..." />
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Knowledge Base</h1>
              <p className="text-gray-600 dark:text-gray-400">Browse helpful articles and documentation</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Only show create button for agents */}
              {user?.role === 'agent' && (
                <Link href="/knowledge-base/create">
                  <Button className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-500">
                    <Plus className="h-4 w-4 mr-2" />
                    New Article
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <Card>
            <div className="space-y-4">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={clearSearch}
                placeholder="Search articles by title..."
                loading={searchLoading}
                autoFocus={false}
                showClearButton={true}
                recentSearches={searchHistory}
                onRecentSearchClick={handleRecentSearchClick}
              />

              {/* Active Filters */}
              {(isSearching || categoryFilter) && (
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active filters:</span>
                  </div>
                  
                  {isSearching && (
                    <Badge color="info" className="flex items-center gap-1">
                      Search: &ldquo;{searchQuery}&rdquo;
                    </Badge>
                  )}
                  
                  {categoryFilter && (
                    <Badge color="info" className="flex items-center gap-1">
                      Category filter
                      <button
                        onClick={() => setCategoryFilter(null)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  
                  <Button
                    size="xs"
                    color="gray"
                    onClick={handleClearFilters}
                  >
                    Clear all
                  </Button>
                </div>
              )}

              {/* Search Results Summary */}
              {isSearching && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {searchLoading ? (
                    <span>Searching...</span>
                  ) : (
                    <span>
                      Found <strong>{searchResults.length}</strong> {searchResults.length === 1 ? 'article' : 'articles'}
                      {searchQuery && ` matching "${searchQuery}"`}
                    </span>
                  )}
                </div>
              )}

              {/* Search Error */}
              {searchError && (
                <Alert color="failure">
                  <span className="font-medium">Search error:</span> {searchError}
                </Alert>
              )}
            </div>
          </Card>

          {/* Articles Table */}
          <Card>
            {paginatedArticles.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  {isSearching ? (
                    <>
                      <h3 className="text-lg font-medium mb-2">No articles found</h3>
                      <p className="text-sm">Try adjusting your search terms or filters</p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-medium mb-2">No articles yet</h3>
                      <p className="text-sm">Articles will appear here once they are created</p>
                      {user?.role === 'agent' && (
                        <Link href="/knowledge-base/create">
                          <Button className="mt-4 bg-orange-600 hover:bg-orange-700 focus:ring-orange-500">
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Article
                          </Button>
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeadCell>Article</TableHeadCell>
                        <TableHeadCell>Category</TableHeadCell>
                        <TableHeadCell>Created</TableHeadCell>
                        <TableHeadCell>Updated</TableHeadCell>
                        <TableHeadCell>
                          <span className="sr-only">Actions</span>
                        </TableHeadCell>
                      </TableRow>
                    </TableHead>
                    <TableBody className="divide-y">
                      {paginatedArticles.map((article) => {
                        const contentPreview = getRichTextDisplay(article.content);
                        const truncatedContent = isSearching
                          ? truncateAroundSearchTerm(contentPreview, searchQuery, 150)
                          : contentPreview.substring(0, 150);

                        return (
                          <TableRow
                            key={article.id}
                            className="bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                              <div>
                                <button
                                  onClick={() => handleArticleClick(article.id)}
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-left"
                                >
                                  <div className="font-medium">
                                    {isSearching
                                      ? highlightSearchTerm(article.title, searchQuery)
                                      : article.title}
                                  </div>
                                </button>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md">
                                  {isSearching
                                    ? highlightSearchTerm(truncatedContent, searchQuery)
                                    : truncatedContent}
                                  {contentPreview.length > 150 && '...'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {article.category?.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {article.subCategory?.name}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span className="whitespace-nowrap">
                                  {formatFullDateTime(article.createdAt)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span className="whitespace-nowrap">
                                  {formatFullDateTime(article.updatedAt)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="xs"
                                className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 text-white"
                                onClick={() => handleArticleClick(article.id)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      showIcons
                    />
                  </div>
                )}

                {/* Results Summary */}
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                  Showing {startIndex + 1}-{Math.min(endIndex, displayArticles.length)} of {displayArticles.length} articles
                </div>
              </>
            )}
          </Card>

        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
