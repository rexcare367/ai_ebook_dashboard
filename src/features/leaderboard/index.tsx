'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUserStore } from '@/utils/user-store';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2, CheckCircle, Trophy, Medal, Award } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading';
import {
  malaysiaStatesAndCities,
  type MalaysiaState
} from '@/constants/malaysia-locations';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  ic_number: string;
  avatar_url: string | null;
  total_score: number;
  reading_sessions: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  total_count: number;
  page: number;
  limit: number;
  school_id: string;
  school_name: string;
}

interface School {
  id: string;
  name: string;
  state: string;
  city: string;
  status: string;
  students_count: number;
  created_at: string;
  updated_at: string;
}

export default function Leaderboard() {
  const { user } = useUserStore();
  const [leaderboardData, setLeaderboardData] =
    useState<LeaderboardData | null>(null);
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  // Check if user is a school manager
  const isSchoolManager = user?.current_role === 'school_manager';
  const userSchool = user?.school;

  // State and city selection for admins
  const [selectedState, setSelectedState] = useState<MalaysiaState>('selangor');
  const [selectedCity, setSelectedCity] = useState<string>('Shah Alam');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);

  // Get available cities based on selected state
  const availableCities = selectedState
    ? malaysiaStatesAndCities[selectedState]
    : [];

  // Fetch all schools once on component mount (only for admin users)
  useEffect(() => {
    if (isSchoolManager) {
      setSchoolsLoading(false);
      return;
    }

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
  }, [isSchoolManager]);

  // Filter schools based on selected state and city (only for admin users)
  useEffect(() => {
    if (isSchoolManager) {
      return;
    }

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
  }, [
    allSchools,
    selectedState,
    selectedCity,
    selectedSchoolId,
    isSchoolManager
  ]);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(
    async (page: number = 1, append: boolean = false) => {
      const schoolId = isSchoolManager ? userSchool?.id : selectedSchoolId;

      if (!schoolId) {
        if (isSchoolManager) {
          toast.error('No school assigned to your account');
        } else {
          toast.error('Please select a school');
        }
        return;
      }

      try {
        const response = await axiosInstance.get(
          `/schools/${schoolId}/leaderboard`,
          {
            params: {
              page,
              limit: 10
            }
          }
        );

        if (response.data.success) {
          const data = response.data.data as LeaderboardData;

          if (append) {
            setLeaderboardData((prev) =>
              prev
                ? {
                    ...data,
                    leaderboard: [...prev.leaderboard, ...data.leaderboard]
                  }
                : data
            );
          } else {
            setLeaderboardData(data);
          }

          setHasMore(data.leaderboard.length === 10);
        } else {
          throw new Error(
            response.data.message || 'Failed to fetch leaderboard'
          );
        }
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || 'Failed to fetch leaderboard data'
        );
      }
    },
    [isSchoolManager, selectedSchoolId, userSchool?.id]
  );

  // Initial data fetch
  useEffect(() => {
    if (
      (isSchoolManager && userSchool?.id) ||
      (!isSchoolManager && selectedSchoolId)
    ) {
      setLoading(true);
      fetchLeaderboard(1, false).finally(() => setLoading(false));
    }
  }, [isSchoolManager, userSchool?.id, selectedSchoolId, fetchLeaderboard]);

  // Load more data
  const loadMore = async () => {
    if (!leaderboardData || loadingMore) return;

    setLoadingMore(true);
    await fetchLeaderboard(leaderboardData.page + 1, true);
    setLoadingMore(false);
  };

  // Get rank icon based on position
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className='h-6 w-6 text-yellow-500' />;
      case 2:
        return <Medal className='h-6 w-6 text-gray-400' />;
      case 3:
        return <Award className='h-6 w-6 text-orange-500' />;
      default:
        return null;
    }
  };

  // Get rank background color
  const getRankBackgroundColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700';
      case 2:
        return 'bg-purple-100 border-purple-300 dark:bg-purple-900/30 dark:border-purple-700';
      case 3:
        return 'bg-orange-100 border-orange-300 dark:bg-orange-900/30 dark:border-orange-700';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/40 dark:border-gray-700';
    }
  };

  // Get text color based on rank
  const getTextColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-700 dark:text-yellow-300';
      case 2:
        return 'text-purple-700 dark:text-purple-300';
      case 3:
        return 'text-orange-700 dark:text-orange-300';
      default:
        return 'text-gray-700 dark:text-gray-200';
    }
  };

  // Get avatar fallback
  const getAvatarFallback = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <LoadingSpinner size='lg' text='Loading leaderboard...' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          {leaderboardData && (
            <p className='text-sm text-gray-600 sm:text-base dark:text-gray-300'>
              {leaderboardData.school_name} • {leaderboardData.total_count}{' '}
              students
            </p>
          )}
        </div>
      </div>

      {/* School Selection for Admins */}
      {!isSchoolManager && (
        <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-center'>
          {/* State Selection */}
          <Select
            value={selectedState}
            onValueChange={(value: MalaysiaState) => setSelectedState(value)}
          >
            <SelectTrigger className='w-full sm:w-[200px]'>
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
          <Select
            value={selectedCity}
            onValueChange={setSelectedCity}
            disabled={!selectedState}
          >
            <SelectTrigger className='w-full sm:w-[200px]'>
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

          {/* School Selection */}
          <Select
            value={selectedSchoolId || ''}
            onValueChange={(value) => setSelectedSchoolId(value)}
            disabled={!selectedCity}
          >
            <SelectTrigger className='w-full sm:w-[300px]'>
              <SelectValue placeholder='Select school' />
              {schoolsLoading && (
                <div className='absolute right-3'>
                  <Loader2 className='h-4 w-4 animate-spin' />
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
      )}

      {/* Alert when no school is selected (only for admin users) */}
      {!isSchoolManager && !selectedSchoolId && !loading && (
        <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-950/30'>
          <p className='text-yellow-800 dark:text-yellow-300'>
            Please select a school to view the leaderboard.
          </p>
        </div>
      )}

      {/* Leaderboard List */}
      {leaderboardData && leaderboardData.leaderboard.length > 0 && (
        <div className='space-y-2'>
          {/* Header Row - Hidden on mobile */}
          <div className='hidden gap-4 rounded-lg bg-gray-50 px-4 py-3 font-medium text-gray-700 md:grid md:grid-cols-[80px_1fr_1fr_120px_120px] dark:bg-gray-800 dark:text-gray-200'>
            <div>Rank</div>
            <div>Name</div>
            <div>School Name</div>
            <div>Quiz Score</div>
            <div>Reading Sessions</div>
          </div>

          {/* Leaderboard Entries */}
          {leaderboardData.leaderboard.map((entry) => (
            <Card
              key={entry.user_id}
              className={`transition-colors hover:shadow-md ${getRankBackgroundColor(entry.rank)}`}
            >
              <CardContent className='p-4'>
                {/* Desktop Layout */}
                <div className='hidden items-center gap-4 md:grid md:grid-cols-[80px_1fr_1fr_120px_120px]'>
                  {/* Rank */}
                  <div className='flex items-center justify-center'>
                    <div className='relative'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-yellow-400 text-sm font-bold text-white'>
                        {entry.rank}
                      </div>
                      {getRankIcon(entry.rank) && (
                        <div className='absolute -top-1 -right-1'>
                          {getRankIcon(entry.rank)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <div className='flex items-center space-x-3'>
                    <Avatar className='h-8 w-8'>
                      <AvatarImage src={entry.avatar_url || ''} />
                      <AvatarFallback className='text-xs'>
                        {getAvatarFallback(entry.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex items-center space-x-2'>
                      <span
                        className={`font-medium ${getTextColor(entry.rank)}`}
                      >
                        {entry.name}
                      </span>
                      <CheckCircle className='h-4 w-4 text-blue-500' />
                    </div>
                  </div>

                  {/* School Name */}
                  <div className={`${getTextColor(entry.rank)}`}>
                    {leaderboardData?.school_name || 'Unknown School'}
                  </div>

                  {/* Quiz Score */}
                  <div className={`font-bold ${getTextColor(entry.rank)}`}>
                    {entry.total_score}
                  </div>

                  {/* Reading Sessions */}
                  <div className={`font-bold ${getTextColor(entry.rank)}`}>
                    {entry.reading_sessions}
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className='space-y-3 md:hidden'>
                  {/* Top row with rank and name */}
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <div className='relative'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-yellow-400 text-sm font-bold text-white'>
                          {entry.rank}
                        </div>
                        {getRankIcon(entry.rank) && (
                          <div className='absolute -top-1 -right-1'>
                            {getRankIcon(entry.rank)}
                          </div>
                        )}
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Avatar className='h-10 w-10'>
                          <AvatarImage src={entry.avatar_url || ''} />
                          <AvatarFallback className='text-sm'>
                            {getAvatarFallback(entry.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className='flex items-center space-x-2'>
                            <span
                              className={`font-medium ${getTextColor(entry.rank)}`}
                            >
                              {entry.name}
                            </span>
                            <CheckCircle className='h-4 w-4 text-blue-500' />
                          </div>
                          <div
                            className={`text-sm text-gray-600 dark:text-gray-300 ${getTextColor(entry.rank)}`}
                          >
                            {leaderboardData?.school_name || 'Unknown School'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom row with scores */}
                  <div className='flex items-center justify-between border-t border-gray-200 pt-2 dark:border-gray-700'>
                    <div className='text-center'>
                      <div className='text-xs font-medium text-gray-500'>
                        Quiz Score
                      </div>
                      <div
                        className={`text-lg font-bold ${getTextColor(entry.rank)}`}
                      >
                        {entry.total_score}
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='text-xs font-medium text-gray-500'>
                        Reading Sessions
                      </div>
                      <div
                        className={`text-lg font-bold ${getTextColor(entry.rank)}`}
                      >
                        {entry.reading_sessions}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className='flex justify-center pt-4'>
              <Button
                onClick={loadMore}
                disabled={loadingMore}
                variant='outline'
                className='w-full max-w-xs'
              >
                {loadingMore ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Loading...
                  </>
                ) : (
                  'Show More'
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {leaderboardData &&
        leaderboardData.leaderboard.length === 0 &&
        !loading && (
          <div className='py-12 text-center'>
            <div className='mb-4 text-gray-400'>
              <Trophy className='mx-auto h-12 w-12' />
            </div>
            <h3 className='mb-2 text-lg font-medium text-gray-900'>
              No leaderboard data
            </h3>
            <p className='text-gray-500'>
              No students have completed quizzes yet for this school.
            </p>
          </div>
        )}
    </div>
  );
}
