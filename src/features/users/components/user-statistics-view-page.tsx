'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Clock,
  Trophy,
  Globe2,
  AlertCircle,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Mail,
  CreditCard
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import {
  UserInfo,
  Book,
  ReadingStatistics,
  UserStatisticsData,
  ApiResponse
} from '@/types';

type UserStatisticsViewPageProps = {
  userId: string;
};

const BOOKS_PER_PAGE = 10;

export default function UserStatisticsViewPage({
  userId
}: UserStatisticsViewPageProps) {
  const router = useRouter();
  const [data, setData] = useState<UserStatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Helper function to format duration in seconds to readable format
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate pagination
  const totalPages = data
    ? Math.ceil(data.reading_statistics.read_books_list.length / BOOKS_PER_PAGE)
    : 0;
  const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
  const endIndex = startIndex + BOOKS_PER_PAGE;
  const currentBooks = data
    ? data.reading_statistics.read_books_list.slice(startIndex, endIndex)
    : [];

  useEffect(() => {
    const fetchUserStatistics = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get<ApiResponse>(
          `/users/${userId}/statistics`
        );

        if (response.data.success && response.data.data) {
          setData(response.data.data);
        } else {
          setError(response.data.error || 'Failed to fetch user statistics');
        }
      } catch (err: any) {
        console.error('Error fetching user statistics:', err);
        setError(
          err.response?.data?.message || 'Failed to fetch user statistics'
        );
        toast.error('Failed to fetch user statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchUserStatistics();
  }, [userId]);

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <LoadingSpinner size='lg' text='Loading user statistics...' />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className='space-y-4'>
        <Button
          variant='outline'
          onClick={() => router.back()}
          className='flex items-center gap-2'
        >
          <ArrowLeft className='h-4 w-4' />
          Back
        </Button>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            {error || 'No data available for this user.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { user_info, reading_statistics } = data;

  return (
    <div className='space-y-6'>
      {/* Header with back button */}
      <div className='flex items-center justify-between'>
        <Button
          variant='outline'
          onClick={() => router.back()}
          className='flex items-center gap-2'
        >
          <ArrowLeft className='h-4 w-4' />
          Back
        </Button>
        <h1 className='text-2xl font-bold'>Student Reading Statistics</h1>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Left side - User Information */}
        <div className='lg:col-span-1'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='h-5 w-5' />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Avatar and basic info */}
              <div className='flex items-center space-x-4'>
                <Avatar className='h-16 w-16'>
                  <AvatarImage src={user_info.avatar_url || undefined} />
                  <AvatarFallback className='text-lg'>
                    {getUserInitials(user_info.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className='text-lg font-semibold'>{user_info.name}</h3>
                  <Badge
                    variant={
                      user_info.registration_status === 'APPROVED'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {user_info.registration_status}
                  </Badge>
                </div>
              </div>

              {/* Detailed information */}
              <div className='space-y-3 text-sm'>
                <div className='flex items-center gap-2'>
                  <CreditCard className='text-muted-foreground h-4 w-4' />
                  <span className='font-medium'>IC Number:</span>
                  <span>{user_info.ic_number}</span>
                </div>

                {user_info.email && (
                  <div className='flex items-center gap-2'>
                    <Mail className='text-muted-foreground h-4 w-4' />
                    <span className='font-medium'>Email:</span>
                    <span>{user_info.email}</span>
                  </div>
                )}

                <div className='flex items-center gap-2'>
                  <MapPin className='text-muted-foreground h-4 w-4' />
                  <span className='font-medium'>School:</span>
                  <span>{user_info.school_name}</span>
                </div>

                <div className='flex items-center gap-2'>
                  <Calendar className='text-muted-foreground h-4 w-4' />
                  <span className='font-medium'>Joined:</span>
                  <span>{formatDate(user_info.created_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Reading Statistics */}
        <div className='space-y-6 lg:col-span-2'>
          {/* Statistics Cards */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center space-x-2'>
                  <BookOpen className='h-8 w-8 text-blue-600' />
                  <div>
                    <p className='text-2xl font-bold'>
                      {reading_statistics.total_read_books_count}
                    </p>
                    <p className='text-muted-foreground text-sm'>
                      Total Books Read
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center space-x-2'>
                  <Clock className='h-8 w-8 text-green-600' />
                  <div>
                    <p className='text-2xl font-bold'>
                      {formatDuration(
                        reading_statistics.total_reading_duration
                      )}
                    </p>
                    <p className='text-muted-foreground text-sm'>
                      Total Reading Time
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center space-x-2'>
                  <Calendar className='h-8 w-8 text-purple-600' />
                  <div>
                    <p className='text-sm font-medium'>Last Read</p>
                    <p className='text-muted-foreground text-sm'>
                      {formatDate(reading_statistics.last_book_read_timestamp)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Language Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Globe2 className='h-5 w-5' />
                Reading by Language
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <div className='rounded-lg bg-blue-50 p-4 text-center'>
                  <p className='text-2xl font-bold text-blue-600'>
                    {reading_statistics.english_read_books_count}
                  </p>
                  <p className='text-sm text-blue-800'>English Books</p>
                </div>
                <div className='rounded-lg bg-red-50 p-4 text-center'>
                  <p className='text-2xl font-bold text-red-600'>
                    {reading_statistics.malay_read_books_count}
                  </p>
                  <p className='text-sm text-red-800'>Malay Books</p>
                </div>
                <div className='rounded-lg bg-yellow-50 p-4 text-center'>
                  <p className='text-2xl font-bold text-yellow-600'>
                    {reading_statistics.mandarin_read_books_count}
                  </p>
                  <p className='text-sm text-yellow-800'>Mandarin Books</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Books List */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <BookOpen className='h-5 w-5' />
                Read Books ({reading_statistics.read_books_list.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reading_statistics.read_books_list.length === 0 ? (
                <div className='text-muted-foreground py-8 text-center'>
                  <BookOpen className='mx-auto mb-2 h-12 w-12 opacity-50' />
                  <p>No books read yet</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book Title</TableHead>
                        <TableHead>Language</TableHead>
                        <TableHead>Genres</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentBooks.map((book) => (
                        <TableRow key={book.id}>
                          <TableCell>
                            <div className='flex items-center space-x-3'>
                              {book.thumbnail && (
                                <img
                                  src={book.thumbnail}
                                  alt={book.title}
                                  className='h-10 w-10 rounded object-cover'
                                />
                              )}
                              <div>
                                <p className='font-medium'>{book.title}</p>
                                {book.author && (
                                  <p className='text-muted-foreground text-sm'>
                                    by {book.author}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant='outline'>{book.language}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className='flex flex-wrap gap-1'>
                              {book.genres.map((genre, index) => (
                                <Badge
                                  key={index}
                                  variant='secondary'
                                  className='text-xs'
                                >
                                  {genre}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                book.status === 'indexed'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {book.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className='mt-4 flex justify-center'>
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() =>
                                setCurrentPage(Math.max(1, currentPage - 1))
                              }
                              className={
                                currentPage === 1
                                  ? 'pointer-events-none opacity-50'
                                  : 'cursor-pointer'
                              }
                            />
                          </PaginationItem>

                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                          ).map((page) => {
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 &&
                                page <= currentPage + 1)
                            ) {
                              return (
                                <PaginationItem key={page}>
                                  <PaginationLink
                                    onClick={() => setCurrentPage(page)}
                                    isActive={currentPage === page}
                                    className='cursor-pointer'
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            } else if (
                              page === currentPage - 2 ||
                              page === currentPage + 2
                            ) {
                              return (
                                <PaginationItem key={page}>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              );
                            }
                            return null;
                          })}

                          <PaginationItem>
                            <PaginationNext
                              onClick={() =>
                                setCurrentPage(
                                  Math.min(totalPages, currentPage + 1)
                                )
                              }
                              className={
                                currentPage === totalPages
                                  ? 'pointer-events-none opacity-50'
                                  : 'cursor-pointer'
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
