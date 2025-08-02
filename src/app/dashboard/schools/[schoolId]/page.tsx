import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import SchoolViewPage from '@/features/schools/components/school-view-page';

export const metadata = {
  title: 'Dashboard : school View'
};

type PageProps = { params: Promise<{ schoolId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <SchoolViewPage schoolId={params.schoolId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
