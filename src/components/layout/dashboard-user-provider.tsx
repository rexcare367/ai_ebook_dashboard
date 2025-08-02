'use client';
import React, { useEffect, useState } from 'react';
import { useUserStore } from '@/utils/user-store';
import { useUser } from '@clerk/nextjs';
import axiosInstance from '@/lib/axios';
import { UserStatusIndicator } from '@/components/ui/user-status-indicator';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardUserProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const user = useUserStore((state) => state.user);
  const { user: clerkUser } = useUser();
  const setUser = useUserStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!clerkUser || !clerkUser.emailAddresses?.[0]?.emailAddress) {
        return;
      }
      try {
        const res = await axiosInstance.get(
          `/admins/by_email/${encodeURIComponent(clerkUser.emailAddresses[0].emailAddress)}`
        );
        if (res.data.success) setUser(res.data.data.admin);
      } catch (fetchErr) {
        // Optionally handle error, e.g. toast or log
        // console.error('Failed to fetch user info', fetchErr);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
    // Only run when Clerk user changes
  }, [clerkUser, setUser]);

  // Show loading component while fetching user data
  if (isLoading) {
    return (
      <div className='flex min-h-screen justify-center p-4'>
        <div className='w-full max-w-md space-y-4'>
          <Skeleton className='mx-auto h-8 w-48' />
          <Skeleton className='mx-auto h-4 w-32' />
          <div className='flex justify-center'>
            <Skeleton className='h-6 w-6 rounded-full' />
          </div>
        </div>
      </div>
    );
  }

  // You can provide user via context or props if needed
  if (user && user.status === 'active') return <>{children}</>;
  else
    return (
      <div className='flex min-h-screen justify-center p-4'>
        <div className='w-full max-w-md'>
          <UserStatusIndicator status={user?.status || 'inactive'} />
        </div>
      </div>
    );
}
