import { School } from '@/constants/data';
import { notFound } from 'next/navigation';
import SchoolForm from './school-analysis-form';
import axiosInstance from '@/lib/axios';

type TSchoolViewPageProps = {
  schoolId: string;
};

export default async function SchoolViewPage({
  schoolId
}: TSchoolViewPageProps) {
  let school = null;
  let pageTitle = 'Create New School';

  if (schoolId !== 'new') {
    try {
      const response = await axiosInstance.get(`/schools/by_id/${schoolId}`);

      if (!response.data || !response.data.success) {
        notFound();
      }

      const data = await response.data;
      if (data.success && data.data.school) {
        school = data.data.school as School;
        pageTitle = `Edit School`;
      } else {
        notFound();
      }
    } catch (error) {
      console.error('Failed to fetch school:', error);
      notFound();
    }
  }

  return <SchoolForm initialData={school} pageTitle={pageTitle} />;
}
