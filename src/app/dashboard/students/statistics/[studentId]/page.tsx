import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import UserStatisticsViewPage from '@/features/users/components/user-statistics-view-page';

export const metadata = {
  title: 'Dashboard : Student Reading Statistics'
};

type PageProps = { params: Promise<{ studentId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <UserStatisticsViewPage userId={params.studentId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
