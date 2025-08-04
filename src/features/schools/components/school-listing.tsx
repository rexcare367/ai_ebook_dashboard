'use client';
import { useEffect, useState } from 'react';
import { School } from '@/constants/data';
import axiosInstance from '@/lib/axios';
import { SchoolTable } from './school-tables';
import { columns } from './school-tables/columns';

export default function AdminListingPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/schools', {
          params: {
            page: 1, // You can replace with actual page logic if needed
            limit: 10, // You can replace with actual limit logic if needed
            search: '' // You can replace with actual search logic if needed
          }
        });
        if (res.data && res.data.success) {
          setTotalCount(res.data.data.total_count || 0);
          setSchools(res.data.data.schools || []);
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
  console.log('schools', schools);

  return (
    <SchoolTable data={schools} totalItems={totalCount} columns={columns} />
  );
}
