'use client';
import { useEffect, useState } from 'react';
import { User, School } from '@/constants/data';
import axiosInstance from '@/lib/axios';
import { UserTable } from './user-tables';
import { getColumns } from './user-tables/columns';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading';
import {
  malaysiaStatesAndCities,
  type MalaysiaState
} from '@/constants/malaysia-locations';
import { useRouter, useSearchParams } from 'next/navigation';

interface UserListingPageProps {
  showRegisteredOnly?: boolean;
}

export default function UserListingPage({
  showRegisteredOnly = false
}: UserListingPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [users, setUsers] = useState<User[]>([]);
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [schoolsLoading, setSchoolsLoading] = useState(true);

  // Set default state as the first state in the list
  const defaultState = Object.keys(malaysiaStatesAndCities)[0] as MalaysiaState;
  const [selectedState, setSelectedState] = useState<MalaysiaState>(() => {
    const stateFromUrl = searchParams.get('state');
    return (stateFromUrl as MalaysiaState) || defaultState;
  });

  // Set default city based on URL or first city of selected state
  const defaultCity = malaysiaStatesAndCities[selectedState][0];
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    const cityFromUrl = searchParams.get('city');
    return cityFromUrl || defaultCity;
  });

  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(
    () => {
      return searchParams.get('school') || null;
    }
  );

  // Get available cities based on selected state
  const availableCities = selectedState
    ? malaysiaStatesAndCities[selectedState]
    : [];

  // Fetch all schools once on component mount
  useEffect(() => {
    const fetchAllSchools = async () => {
      setSchoolsLoading(true);
      try {
        const res = await axiosInstance.get('/schools', {
          params: {
            page: 1,
            limit: 100, // Fetch all schools
            search: ''
          }
        });
        if (res.data && res.data.success) {
          const schoolsList = res.data.data.schools || [];
          setAllSchools(schoolsList);
        }
      } catch (error) {
        toast.error('Failed to fetch schools');
      } finally {
        setSchoolsLoading(false);
      }
    };

    fetchAllSchools();
  }, []);

  // Filter schools based on selected state and city
  useEffect(() => {
    const filtered = allSchools.filter(
      (school) =>
        school.state.toLowerCase() === selectedState.toLowerCase() &&
        school.city.toLowerCase() === selectedCity.toLowerCase()
    );
    setFilteredSchools(filtered);

    if (filtered.length > 0 && !selectedSchoolId) {
      setSelectedSchoolId(filtered[0].id);
    } else if (filtered.length === 0) {
      setSelectedSchoolId(null);
    }
  }, [allSchools, selectedState, selectedCity, selectedSchoolId]);

  // Update URL when selections change
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (selectedState) {
      params.set('state', selectedState);
    } else {
      params.delete('state');
    }

    if (selectedCity) {
      params.set('city', selectedCity);
    } else {
      params.delete('city');
    }

    if (selectedSchoolId) {
      params.set('school', selectedSchoolId);
    } else {
      params.delete('school');
    }

    router.push(`?${params.toString()}`);
  }, [selectedState, selectedCity, selectedSchoolId, router, searchParams]);

  // Reset dependent fields when state changes
  useEffect(() => {
    if (selectedState !== defaultState) {
      // Don't reset on initial mount
      const firstCity = malaysiaStatesAndCities[selectedState][0];
      setSelectedCity(firstCity);
    }
  }, [selectedState, defaultState]);

  // Reset school when city changes
  useEffect(() => {
    if (selectedCity !== defaultCity) {
      // Don't reset on initial mount
      setSelectedSchoolId(null);
    }
  }, [selectedCity, defaultCity]);

  // Fetch users based on URL parameters and selected school
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedSchoolId) {
        setUsers([]);
        setTotalCount(0);
        return;
      }

      setLoading(true);
      try {
        // Extract parameters from URL query string
        const page = searchParams.get('page') || '1';
        const perPage = searchParams.get('perPage') || '10';
        const sort = searchParams.get('sort') || '';
        const name = searchParams.get('name') || '';
        const ic_number = searchParams.get('ic_number') || '';

        // Prepare API parameters
        const apiParams: any = {
          page: parseInt(page),
          perPage: parseInt(perPage),
          sort: sort || undefined,
          name: name || undefined,
          ic_number: ic_number || undefined
        };

        // If showRegisteredOnly is true, filter by registration_status = 'completed'
        if (showRegisteredOnly) {
          apiParams.status = 'COMPLETED';
        }

        const res = await axiosInstance.get(
          `/users/by_school/${selectedSchoolId}`,
          {
            params: apiParams
          }
        );
        if (res.data && res.data.success) {
          setTotalCount(res.data.data.total_count || 0);
          setUsers(res.data.data.users || []);
        }
      } catch (error) {
        toast.error('Failed to fetch users');
        setUsers([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedSchoolId, searchParams, showRegisteredOnly]);

  return (
    <div className='space-y-4'>
      {schoolsLoading ? (
        <div className='flex items-center justify-center p-8'>
          <LoadingSpinner size='lg' text='Loading schools...' />
        </div>
      ) : (
        <>
          <div className='flex items-center space-x-4'>
            {/* State Selection */}
            <Select
              value={selectedState}
              onValueChange={(value: MalaysiaState) => setSelectedState(value)}
            >
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

            {/* City Selection - only enabled if state is selected */}
            <Select
              value={selectedCity}
              onValueChange={setSelectedCity}
              disabled={!selectedState}
            >
              <SelectTrigger className='w-[200px]'>
                <SelectValue placeholder='Select city' />
              </SelectTrigger>
              <SelectContent>
                {availableCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* School Selection - only enabled if city is selected */}
            <Select
              value={selectedSchoolId || ''}
              onValueChange={(value) => {
                setSelectedSchoolId(value);
              }}
              disabled={!selectedCity}
            >
              <SelectTrigger className='w-[300px]'>
                <SelectValue placeholder='Select school' />
                {schoolsLoading && (
                  <div className='absolute right-3'>
                    <LoadingSpinner size='sm' />
                  </div>
                )}
              </SelectTrigger>
              <SelectContent>
                {schoolsLoading ? (
                  <div className='flex items-center justify-center p-4'>
                    <LoadingSpinner size='sm' text='Loading schools...' />
                  </div>
                ) : filteredSchools.length === 0 ? (
                  <div className='text-muted-foreground p-4 text-center text-sm'>
                    No schools found for this city
                  </div>
                ) : (
                  filteredSchools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Alert when no school is selected */}
          {!selectedSchoolId && !loading && (
            <Alert>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                Please select a school to view the{' '}
                {showRegisteredOnly ? 'registered ' : ''}students list.
              </AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className='flex items-center justify-center p-8'>
              <LoadingSpinner size='lg' text='Loading users...' />
            </div>
          ) : (
            selectedSchoolId && (
              <>
                <div className='h-full'>
                  <UserTable
                    data={users}
                    totalItems={totalCount}
                    columns={getColumns(showRegisteredOnly)}
                  />
                </div>
              </>
            )
          )}
        </>
      )}
    </div>
  );
}
