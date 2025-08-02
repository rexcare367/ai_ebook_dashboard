import { Admin } from '@/constants/data';
import { notFound } from 'next/navigation';
import AdminForm from './admin-form';
import axiosInstance from '@/lib/axios';

type TAdminViewPageProps = {
  adminId: string;
};

export default async function AdminViewPage({ adminId }: TAdminViewPageProps) {
  let admin = null;
  let pageTitle = 'Create New Admin';

  if (adminId !== 'new') {
    try {
      const response = await axiosInstance.get(`/admins/by_id/${adminId}`);

      if (!response.data || !response.data.success) {
        notFound();
      }

      const data = await response.data;
      if (data.success && data.data.admin) {
        admin = data.data.admin as Admin;
        pageTitle = `Edit Admin`;
      } else {
        notFound();
      }
    } catch (error) {
      console.error('Failed to fetch admin:', error);
      notFound();
    }
  }

  return <AdminForm initialData={admin} pageTitle={pageTitle} />;
}
