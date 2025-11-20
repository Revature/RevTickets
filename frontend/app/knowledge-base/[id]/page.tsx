'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Breadcrumb, BreadcrumbItem, Badge } from 'flowbite-react';
import Link from 'next/link';
import { ArrowLeft, Calendar, BookOpen, Tag, Edit } from 'lucide-react';
import { MainLayout, ProtectedRoute } from '../../../src/app/shared/components';
import { LoadingSpinner } from '../../../src/app/shared/components';
import { articlesApi } from '../../../src/lib/api';
import { formatFullDateTime } from '../../../src/lib/utils';
import { useAuth } from '../../../src/contexts/AuthContext';
import type { Article } from '../../../src/app/shared/types';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const articleId = params.id as string;
  const isAgent = user?.role === 'agent';

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await articlesApi.getById(articleId);
        setArticle(data);
      } catch (error) {
        console.error('Failed to fetch article:', error);
        setError('Article not found');
      } finally {
        setLoading(false);
      }
    };

    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push(`/knowledge-base/${articleId}/edit`);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <LoadingSpinner text="Loading article..." />
        </MainLayout>
      </ProtectedRoute>
    );
  }

  if (error || !article) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Article Not Found
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              The article you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button onClick={handleBack} color="gray">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container mx-auto px-4 py-8 space-y-6">
          {/* Breadcrumbs */}
          <Breadcrumb className="mb-4">
            <BreadcrumbItem>
              <Link href="/knowledge-base" className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <BookOpen className="h-4 w-4 mr-2" />
                Knowledge Base
              </Link>
            </BreadcrumbItem>
            <BreadcrumbItem>{article.title}</BreadcrumbItem>
          </Breadcrumb>


          {/* Article Layout */}
          <div className="max-w-4xl mx-auto">
            {/* Article Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-6">
              {/* Edit Button (Agent Only) */}
              {isAgent && (
                <div className="flex justify-end mb-4">
                  <Button
                    onClick={handleEdit}
                    className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Article
                  </Button>
                </div>
              )}
              
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                    {article.title}
                  </h1>
                  {article.updatedAt !== article.createdAt && (
                    <Badge color="warning" size="sm" className="mt-2">
                      Edited
                    </Badge>
                  )}
                </div>
                
                {/* Article Meta */}
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4" />
                    <span className="font-medium">{article.category?.name}</span>
                    <span className="text-gray-400">→</span>
                    <span>{article.subCategory?.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Published {formatFullDateTime(article.createdAt)}</span>
                  </div>
                  {article.updatedAt !== article.createdAt && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-orange-600 dark:text-orange-400 font-medium">
                        Last edited {formatFullDateTime(article.updatedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-8">
                <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
                  <div 
                    className="text-base leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: typeof article.content === 'string' 
                        ? article.content 
                        : article.content?.html || '' 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}