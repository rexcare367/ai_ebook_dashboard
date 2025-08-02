'use client';
import { useEffect, useState } from 'react';
import { Admin } from '@/constants/data';
import axiosInstance from '@/lib/axios';
import { AdminTable } from './admin-tables';
import { columns } from './admin-tables/columns';

export default function AdminListingPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/admins', {
          params: {
            page: 1, // You can replace with actual page logic if needed
            limit: 10, // You can replace with actual limit logic if needed
            search: '' // You can replace with actual search logic if needed
          }
        });
        if (res.data && res.data.success) {
          setTotalCount(res.data.data.total_count || 0);
          setAdmins(res.data.data.admins || []);
        }
      } catch (error) {
        // Optionally handle error, e.g. toast or log
        console.error('Failed to fetch admins', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <AdminTable data={admins} totalItems={totalCount} columns={columns} />;
}
