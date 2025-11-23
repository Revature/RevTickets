'use client';

import { useRouter } from 'next/navigation';
import { Button } from 'flowbite-react';
import { BarChart3 } from 'lucide-react';
import { MainLayout } from '../../src/app/shared/components';
import { TicketsList } from '../../src/app/features/tickets';

export default function TicketsPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Tickets</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View and manage all your support tickets
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
        
        <TicketsList />
      </div>
    </MainLayout>
  );
}