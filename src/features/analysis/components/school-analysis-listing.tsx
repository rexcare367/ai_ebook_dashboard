'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { AnalysisResult, SingleSchoolAnalysisResult } from '@/constants/data';
import axiosInstance from '@/lib/axios';
import { AnalysisTable } from './school-analysis-tables';
import { columns } from './school-analysis-tables/columns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading';
import {
  malaysiaStatesAndCities,
  type MalaysiaState
} from '@/constants/malaysia-locations';
import { useUserStore } from '@/utils/user-store';

export default function AdminListingPage() {
  const [result, setResult] = useState<AnalysisResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);

  // Check if user is school_manager
  const isSchoolManager = user?.current_role === 'school_manager';

  // Get current values from URL params (only for admin)
  const currentState =
    searchParams.get('state') || Object.keys(malaysiaStatesAndCities)[0];
  const currentCity =
    searchParams.get('city') ||
    (currentState
      ? malaysiaStatesAndCities[currentState as MalaysiaState]?.[0]
      : '');

  const updateFilters = (newState?: string, newCity?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newState !== undefined) {
      if (newState) {
        params.set('state', newState);
      } else {
        params.delete('state');
      }
    }

    if (newCity !== undefined) {
      if (newCity) {
        params.set('city', newCity);
      } else {
        params.delete('city');
      }
    }

    // Reset to page 1 when filters change
    params.set('page', '1');

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleStateChange = (value: string) => {
    // Reset city when state changes
    const firstCity =
      malaysiaStatesAndCities[value as MalaysiaState]?.[0] || '';
    updateFilters(value, firstCity);
  };

  const handleCityChange = (value: string) => {
    updateFilters(currentState, value);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        if (isSchoolManager && user.school_id) {
          // Fetch single school analytics for school_manager
          const res = await axiosInstance.get(
            `/schools/${user.school_id}/analytics`
          );
          if (res.data && res.data.success) {
            const singleSchoolData: SingleSchoolAnalysisResult = res.data.data;
            // Convert single school data to array format for table
            const transformedData: AnalysisResult = {
              id: singleSchoolData.id,
              school_name: singleSchoolData.school_name,
              state: singleSchoolData.state,
              city: singleSchoolData.city,
              status: singleSchoolData.status,
              students_count: singleSchoolData.total_students,
              created_at: singleSchoolData.created_at,
              updated_at: singleSchoolData.updated_at,
              total_students: singleSchoolData.total_students,
              count_of_registered_students:
                singleSchoolData.count_of_registered_students,
              percent_of_registered_students:
                singleSchoolData.percent_of_registered_students,
              count_of_active_students:
                singleSchoolData.count_of_active_students,
              percent_of_active_students:
                singleSchoolData.percent_of_active_students
            };
            setResult([transformedData]);
            setTotalCount(1);
          }
        } else {
          // Admin role: fetch all schools analytics with filters
          const page = searchParams.get('page') || '1';
          const perPage = searchParams.get('perPage') || '10';
          const city =
            searchParams.get('city') ||
            malaysiaStatesAndCities[currentState as MalaysiaState]?.[0] ||
            '';
          const state = searchParams.get('state') || currentState || '';
          const name = searchParams.get('school_name') || '';
          const sort = searchParams.get('sort') || '';

          const res = await axiosInstance.get('/schools/analytics', {
            params: {
              page: parseInt(page),
              perPage: parseInt(perPage),
              city: city,
              state: state,
              name: name || undefined,
              sort: sort || undefined
            }
          });
          if (res.data && res.data.success) {
            setTotalCount(res.data.data.total_count || 0);
            setResult(res.data.data.data || []);
          }
        }
      } catch (error) {
        // Optionally handle error, e.g. toast or log
        // console.error('Failed to fetch schools', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams, user, isSchoolManager, currentState]);

  return (
    <div className='space-y-4'>
      {/* Only show state/city selectors for admin users */}
      {!isSchoolManager && (
        <div className='flex items-center space-x-4'>
          {/* State Selection */}
          <Select value={currentState} onValueChange={handleStateChange}>
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='Select state' />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(malaysiaStatesAndCities).map((state) => (
                <SelectItem key={state} value={state}>
                  {state.charAt(0).toUpperCase() + state.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* City Selection */}
          <Select value={currentCity} onValueChange={handleCityChange}>
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='Select city' />
            </SelectTrigger>
            <SelectContent>
              {currentState &&
                malaysiaStatesAndCities[currentState as MalaysiaState]?.map(
                  (city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  )
                )}
            </SelectContent>
          </Select>
        </div>
      )}

      {loading ? (
        <div className='flex items-center justify-center p-8'>
          <LoadingSpinner size='lg' text='Loading analysis data...' />
        </div>
      ) : (
        <AnalysisTable
          data={result}
          totalItems={totalCount}
          columns={columns}
        />
      )}
    </div>
  );
}
