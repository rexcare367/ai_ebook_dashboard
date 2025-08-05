'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { School } from '@/constants/data';
import axiosInstance from '@/lib/axios';
import { SchoolTable } from './school-tables';
import { columns } from './school-tables/columns';

export default function AdminListingPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Extract parameters from URL query string
        const page = searchParams.get('page') || '1';
        const perPage = searchParams.get('perPage') || '10';
        const city = searchParams.get('city') || '';
        const state = searchParams.get('state') || '';
        const name = searchParams.get('name') || '';
        const sort = searchParams.get('sort') || '';

        const res = await axiosInstance.get('/schools', {
          params: {
            page: parseInt(page),
            perPage: parseInt(perPage),
            city: city || undefined,
            state: state || undefined,
            name: name || undefined,
            sort: sort || undefined
          }
        });
        if (res.data && res.data.success) {
          setTotalCount(res.data.data.total_count || 0);
          setSchools(res.data.data.schools || []);
        }
      } catch (error) {
        // Optionally handle error, e.g. toast or log
        console.error('Failed to fetch schools', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  if (loading) {
    <div>Loading...</div>;
  }
  return (
    <SchoolTable data={schools} totalItems={totalCount} columns={columns} />
  );
}
