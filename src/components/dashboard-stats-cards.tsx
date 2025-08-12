'use client';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import {
  IconTrendingDown,
  IconTrendingUp,
  IconSchool,
  IconBook,
  IconUser,
  IconUsers
} from '@tabler/icons-react';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { Skeleton } from '@/components/ui/skeleton';

export const DashboardStatsCards: React.FC = () => {
  const { stats, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className='@container/card'>
            <CardHeader>
              <Skeleton className='mb-2 h-4 w-24' />
              <Skeleton className='mb-2 h-8 w-20' />
              <Skeleton className='h-6 w-16' />
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5'>
              <Skeleton className='mb-1 h-4 w-32' />
              <Skeleton className='h-3 w-24' />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className='@container/card'>
            <CardHeader>
              <CardDescription>Error loading data</CardDescription>
              <CardTitle className='text-2xl font-semibold text-red-500 tabular-nums @[250px]/card:text-3xl'>
                --
              </CardTitle>
              <CardAction>
                <Badge variant='outline' className='text-red-500'>
                  Error
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium text-red-500'>
                Failed to load data
              </div>
              <div className='text-muted-foreground'>
                Please try refreshing the page
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // Ensure stats object exists and has all required properties with fallback values
  const safeStats = {
    totalStudents: stats?.totalStudents ?? 0,
    totalSchools: stats?.totalSchools ?? 0,
    totalBooks: stats?.totalBooks ?? 0,
    totalAdmins: stats?.totalAdmins ?? 0
  };

  return (
    <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
      <Card className='@container/card'>
        <CardHeader>
          <CardDescription className='flex items-center gap-2'>
            <IconUsers className='h-4 w-4' />
            Total Students
          </CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {safeStats.totalStudents.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <IconTrendingUp className='h-3 w-3' />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Growing student body <IconTrendingUp className='size-4' />
          </div>
          <div className='text-muted-foreground'>
            +{Math.floor(safeStats.totalStudents * 0.125)} new registrations
            this month
          </div>
        </CardFooter>
      </Card>

      <Card className='@container/card'>
        <CardHeader>
          <CardDescription className='flex items-center gap-2'>
            <IconSchool className='h-4 w-4' />
            Total Schools
          </CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {safeStats.totalSchools.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <IconTrendingUp className='h-3 w-3' />
              +8.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Expanding network <IconTrendingUp className='size-4' />
          </div>
          <div className='text-muted-foreground'>
            {Math.floor(safeStats.totalSchools * 0.082)} new partnerships this
            quarter
          </div>
        </CardFooter>
      </Card>

      <Card className='@container/card'>
        <CardHeader>
          <CardDescription className='flex items-center gap-2'>
            <IconBook className='h-4 w-4' />
            Total Books
          </CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {safeStats.totalBooks.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <IconTrendingUp className='h-3 w-3' />
              +15.3%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Growing library <IconTrendingUp className='size-4' />
          </div>
          <div className='text-muted-foreground'>
            {Math.floor(safeStats.totalBooks * 0.153)} new titles added this
            month
          </div>
        </CardFooter>
      </Card>

      <Card className='@container/card'>
        <CardHeader>
          <CardDescription className='flex items-center gap-2'>
            <IconUser className='h-4 w-4' />
            Total Admins
          </CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {safeStats.totalAdmins.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <IconTrendingUp className='h-3 w-3' />
              +5.7%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Strong team growth <IconTrendingUp className='size-4' />
          </div>
          <div className='text-muted-foreground'>
            {Math.floor(safeStats.totalAdmins * 0.057)} new administrators
            joined
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
