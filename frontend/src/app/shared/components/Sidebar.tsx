'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Ticket, 
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Tags,
  User
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from 'flowbite-react';
import { useAuth } from '../../../contexts/AuthContext';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Build sidebar items based on user role
  const sidebarItems = user?.role === 'agent' ? [
    // Agent navigation: Dashboard, My Tickets, Categories, Knowledge Base, Profile
    {
      href: '/',
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      href: '/tickets',
      icon: Ticket,
      label: 'My Tickets',
    },
    {
      href: '/categories',
      icon: Tags,
      label: 'Categories',
    },
    {
      href: '/knowledge-base',
      icon: BookOpen,
      label: 'Knowledge Base',
    },
    {
      href: '/profile',
      icon: User,
      label: 'Profile',
    },
  ] : [
    // Regular user navigation: My Tickets and Knowledge Base
    {
      href: '/tickets',
      icon: Ticket,
      label: 'My Tickets',
    },
    {
      href: '/knowledge-base',
      icon: BookOpen,
      label: 'Knowledge Base',
    },
  ];

  return (
    <div 
      className={`fixed top-16 left-0 z-20 flex h-[calc(100vh-4rem)] flex-shrink-0 flex-col duration-300 transition-all bg-white dark:bg-gray-900 border-r border-orange-200 dark:border-orange-800 shadow-sm ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Toggle Button */}
      <div className="flex justify-end p-3 border-b border-orange-100 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-900/10">
        <Button
          size="xs"
          onClick={onToggleCollapse}
          className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 text-white"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-2 space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname === '/' && item.href === '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:text-orange-600 dark:hover:text-orange-400'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${
                isActive 
                  ? 'text-orange-600 dark:text-orange-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`} />
              {!isCollapsed && (
                <span className="ml-3 truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-orange-100 dark:border-orange-900">
        {!isCollapsed && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            TicketSystem v1.0
          </div>
        )}
      </div>
    </div>
  );
}