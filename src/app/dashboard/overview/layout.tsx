'use client';

import PageContainer from '@/components/layout/page-container';
import React from 'react';
import { useUserStore } from '@/utils/user-store';
import { DashboardStatsCards } from '@/components/dashboard-stats-cards';

export default function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  const user = useUserStore((state) => state.user);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight capitalize'>
            👋 {user?.name || 'Welcome back'}!
          </h2>
        </div>

        <DashboardStatsCards />

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-7'>{bar_stats}</div>
          {/* <div className='col-span-4 md:col-span-3'>{pie_stats}</div> */}
          <div className='col-span-7'>{area_stats}</div>
          {/* <div className='col-span-4 md:col-span-3'>{sales}</div> */}
        </div>
      </div>
    </PageContainer>
  );
}
