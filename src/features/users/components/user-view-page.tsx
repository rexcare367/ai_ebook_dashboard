import { User } from '@/constants/data';
import { notFound } from 'next/navigation';
import UserForm from './user-form';
import axiosInstance from '@/lib/axios';

type TUserViewPageProps = {
  userId: string;
};

export default async function UserViewPage({ userId }: TUserViewPageProps) {
  let user = null;
  let pageTitle = 'Create New User';

  if (userId !== 'new') {
    try {
      const response = await axiosInstance.get(`/users/by_id/${userId}`);

      if (!response.data || !response.data.success) {
        notFound();
      }

      const data = await response.data;
      if (data.success && data.data.user) {
        user = data.data.user as User;
        pageTitle = `Edit User`;
      } else {
        notFound();
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      notFound();
    }
  }

  return <UserForm initialData={user} pageTitle={pageTitle} />;
}
