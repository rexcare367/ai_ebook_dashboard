import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import DashboardUserProvider from '@/components/layout/dashboard-user-provider';

export const metadata: Metadata = {
  title: 'AI Ebook Library',
  description: 'AI Ebook Library Admin'
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  return (
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>
          <Header />
          <DashboardUserProvider>{children}</DashboardUserProvider>
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
