'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { AnalysisResult } from '@/constants/data';
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

export default function AdminListingPage() {
  const [result, setResult] = useState<AnalysisResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get current values from URL params
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

  const clearFilters = () => {
    const firstState = Object.keys(malaysiaStatesAndCities)[0];
    const firstCity =
      malaysiaStatesAndCities[firstState as MalaysiaState]?.[0] || '';
    updateFilters(firstState, firstCity);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Extract parameters from URL query string
        const page = searchParams.get('page') || '1';
        const perPage = searchParams.get('perPage') || '10';
        const city = searchParams.get('city') || '';
        const state = searchParams.get('state') || '';
        const name = searchParams.get('school_name') || '';
        const sort = searchParams.get('sort') || '';

        const res = await axiosInstance.get('/schools/analytics', {
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
          setResult(res.data.data.data || []);
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

  return (
    <div className='space-y-4'>
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
