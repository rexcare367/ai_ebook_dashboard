import { useState, useEffect } from 'react';
import { DashboardStats } from '@/types/features';
import axiosInstance from '@/lib/axios';
import { useUserStore } from '@/utils/user-store';

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSchools: 0,
    totalBooks: 0,
    totalAdmins: 0,
    totalStudents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useUserStore((state) => state.user);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all statistics in parallel using axiosInstance
      const [schoolsRes, booksRes, adminsRes, studentsRes] = await Promise.all([
        axiosInstance.get('/schools?page=1&perPage=1'),
        axiosInstance.get('/books/?page=1&perPage=1'),
        axiosInstance.get('/admins?page=1&perPage=1'),
        axiosInstance.get(
          `/users/by_school/${user?.school_id || 'daa742ed-ff16-4ccf-913a-eefbdb0df66a'}?page=1&perPage=1`
        )
      ]);

      // Safely extract total counts with fallback values
      const totalSchools = schoolsRes?.data?.data?.total_count ?? 0;
      const totalBooks = booksRes?.data?.data?.total_count ?? 0;
      const totalAdmins = adminsRes?.data?.data?.total_count ?? 0;
      const totalStudents = studentsRes?.data?.data?.total_students ?? 0;

      setStats({
        totalSchools,
        totalBooks,
        totalAdmins,
        totalStudents
      });
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message || 'Failed to fetch dashboard statistics');

      // Set fallback values on error
      setStats({
        totalSchools: 0,
        totalBooks: 0,
        totalAdmins: 0,
        totalStudents: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.school_id) {
      fetchStats();
    } else {
      // If no user or school_id, still set loading to false
      setLoading(false);
    }
  }, [user?.school_id]);

  const refetch = () => {
    fetchStats();
  };

  return {
    stats,
    loading,
    error,
    refetch
  };
};
