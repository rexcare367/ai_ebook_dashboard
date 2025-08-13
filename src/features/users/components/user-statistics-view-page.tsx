'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  BookOpen,
  Clock,
  Globe2,
  AlertCircle,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Mail,
  CreditCard,
  Edit3,
  Save,
  X
} from 'lucide-react';
import moment from 'moment';
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
import { UserStatisticsData, ApiResponse } from '@/types';
import * as z from 'zod';

type UserStatisticsViewPageProps = {
  userId: string;
};

const BOOKS_PER_PAGE = 10;

// Type guard for registration status
const isValidRegistrationStatus = (
  status: string
): status is 'PENDING' | 'APPROVED' | 'COMPLETED' => {
  return ['PENDING', 'APPROVED', 'COMPLETED'].includes(status);
};

// Validation schema for user edit form
const userEditSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  ic_number: z.string().min(1, { message: 'IC Number is required' }),
  email: z
    .string()
    .email({ message: 'Please enter a valid email address' })
    .optional()
    .or(z.literal('')),
  school_name: z.string().min(1, { message: 'School name is required' }),
  registration_status: z.enum(['PENDING', 'APPROVED', 'COMPLETED'], {
    message: 'Please select a valid registration status'
  }),
  birth: z.string().optional(),
  address: z.string().optional(),
  parent_phone_number: z.string().optional(),
  parent_email: z
    .string()
    .email({ message: 'Please enter a valid email address' })
    .optional()
    .or(z.literal('')),
  parent_relationship: z.string().optional()
});

type UserEditFormData = z.infer<typeof userEditSchema>;

export default function UserStatisticsViewPage({
  userId
}: UserStatisticsViewPageProps) {
  const router = useRouter();
  const [data, setData] = useState<UserStatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserEditFormData>({
    name: '',
    ic_number: '',
    email: '',
    school_name: '',
    registration_status: 'PENDING',
    birth: '',
    address: '',
    parent_phone_number: '',
    parent_email: '',
    parent_relationship: ''
  });
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof UserEditFormData, string>>
  >({});
  const [saving, setSaving] = useState(false);

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
          // Initialize edit form with current data
          setEditForm({
            name: response.data.data.user_info.name,
            ic_number: response.data.data.user_info.ic_number,
            email: response.data.data.user_info.email || '',
            school_name: response.data.data.user_info.school_name,
            registration_status: isValidRegistrationStatus(
              response.data.data.user_info.registration_status
            )
              ? response.data.data.user_info.registration_status
              : 'PENDING',
            birth: response.data.data.user_info.birth || '',
            address: response.data.data.user_info.address || '',
            parent_phone_number:
              response.data.data.user_info.parent?.phone_number || '',
            parent_email: response.data.data.user_info.parent?.email || '',
            parent_relationship:
              response.data.data.user_info.parent?.relationship || ''
          });
        } else {
          setError(response.data.error || 'Failed to fetch user statistics');
        }
      } catch (err: any) {
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

  const validateForm = (): boolean => {
    try {
      userEditSchema.parse(editForm);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof UserEditFormData, string>> = {};
        error.errors.forEach((err) => {
          const field = err.path?.[0];
          if (typeof field === 'string') {
            errors[field as keyof UserEditFormData] = err.message;
          }
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormErrors({});
    // Reset form to original data
    if (data) {
      setEditForm({
        name: data.user_info.name,
        ic_number: data.user_info.ic_number,
        email: data.user_info.email || '',
        school_name: data.user_info.school_name,
        registration_status: isValidRegistrationStatus(
          data.user_info.registration_status
        )
          ? data.user_info.registration_status
          : 'PENDING',
        birth: data.user_info.birth || '',
        address: data.user_info.address || '',
        parent_phone_number: data.user_info.parent?.phone_number || '',
        parent_email: data.user_info.parent?.email || '',
        parent_relationship: data.user_info.parent?.relationship || ''
      });
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the form errors before saving');
      return;
    }

    setSaving(true);
    try {
      const response = await axiosInstance.patch(`/users/${userId}`, {
        name: editForm.name,
        ic_number: editForm.ic_number,
        email: editForm.email || null,
        school_name: editForm.school_name,
        registration_status: editForm.registration_status,
        birth: editForm.birth || null,
        address: editForm.address || null,
        parent: {
          phone_number: editForm.parent_phone_number || null,
          email: editForm.parent_email || null,
          relationship: editForm.parent_relationship || null
        }
      });

      if (response.data.success) {
        toast.success('User information updated successfully!');
        // Update local data
        if (data) {
          setData({
            ...data,
            user_info: {
              ...data.user_info,
              name: editForm.name,
              ic_number: editForm.ic_number,
              email: editForm.email || null,
              school_name: editForm.school_name,
              registration_status: editForm.registration_status,
              birth: editForm.birth || undefined,
              address: editForm.address || undefined,
              parent: {
                ...(data.user_info.parent || {}),
                phone_number: editForm.parent_phone_number || undefined,
                email: editForm.parent_email || undefined,
                relationship: editForm.parent_relationship || undefined
              }
            }
          });
        }
        setIsEditing(false);
        setFormErrors({});
      } else {
        toast.error('Failed to update user information');
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Failed to update user information'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserEditFormData, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

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
              <div className='flex items-center justify-between'>
                <CardTitle className='flex items-center gap-2'>
                  <User className='h-5 w-5' />
                  Student Information
                </CardTitle>
                {!isEditing ? (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleEdit}
                    className='flex items-center gap-2'
                  >
                    <Edit3 className='h-4 w-4' />
                    Edit
                  </Button>
                ) : (
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleCancel}
                      className='flex items-center gap-2'
                    >
                      <X className='h-4 w-4' />
                      Cancel
                    </Button>
                    <Button
                      size='sm'
                      onClick={handleSave}
                      disabled={saving}
                      className='flex items-center gap-2'
                    >
                      <Save className='h-4 w-4' />
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                )}
              </div>
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
                <div className='flex-1'>
                  {isEditing ? (
                    <div className='space-y-3'>
                      <div>
                        <Label htmlFor='name' className='text-sm font-medium'>
                          Full Name *
                        </Label>
                        <Input
                          id='name'
                          value={editForm.name}
                          onChange={(e) =>
                            handleInputChange('name', e.target.value)
                          }
                          className={`mt-1 ${formErrors.name ? 'border-red-500' : ''}`}
                          placeholder='Enter full name'
                        />
                        {formErrors.name && (
                          <p className='mt-1 text-xs text-red-500'>
                            {formErrors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor='registration_status'
                          className='text-sm font-medium'
                        >
                          Registration Status *
                        </Label>
                        <Select
                          value={editForm.registration_status}
                          onValueChange={(value) =>
                            handleInputChange('registration_status', value)
                          }
                        >
                          <SelectTrigger
                            className={`mt-1 ${formErrors.registration_status ? 'border-red-500' : ''}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='PENDING'>PENDING</SelectItem>
                            <SelectItem value='APPROVED'>APPROVED</SelectItem>
                            <SelectItem value='COMPLETED'>COMPLETED</SelectItem>
                          </SelectContent>
                        </Select>
                        {formErrors.registration_status && (
                          <p className='mt-1 text-xs text-red-500'>
                            {formErrors.registration_status}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className='text-lg font-semibold'>
                        {user_info.name}
                      </h3>
                      <Badge
                        variant={
                          user_info.registration_status === 'APPROVED'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {user_info.registration_status}
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              {/* Detailed information */}
              <div className='space-y-3 text-sm'>
                <div className='flex items-center gap-2'>
                  <CreditCard className='text-muted-foreground h-4 w-4' />
                  <span className='font-medium'>IC Number:</span>
                  {isEditing ? (
                    <div className='ml-auto flex-1'>
                      <Input
                        value={editForm.ic_number}
                        onChange={(e) =>
                          handleInputChange('ic_number', e.target.value)
                        }
                        className={`w-full ${formErrors.ic_number ? 'border-red-500' : ''}`}
                        placeholder='Enter IC number'
                      />
                      {formErrors.ic_number && (
                        <p className='mt-1 text-xs text-red-500'>
                          {formErrors.ic_number}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span>{user_info.ic_number}</span>
                  )}
                </div>

                <div className='flex items-center gap-2'>
                  <Mail className='text-muted-foreground h-4 w-4' />
                  <span className='font-medium'>Email:</span>
                  {isEditing ? (
                    <div className='ml-auto flex-1'>
                      <Input
                        type='email'
                        value={editForm.email}
                        onChange={(e) =>
                          handleInputChange('email', e.target.value)
                        }
                        className={`w-full ${formErrors.email ? 'border-red-500' : ''}`}
                        placeholder='Enter email address'
                      />
                      {formErrors.email && (
                        <p className='mt-1 text-xs text-red-500'>
                          {formErrors.email}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span>{user_info.email || 'No email provided'}</span>
                  )}
                </div>

                <div className='flex items-center gap-2'>
                  <MapPin className='text-muted-foreground h-4 w-4' />
                  <span className='font-medium'>School:</span>
                  {isEditing ? (
                    <div className='ml-auto flex-1'>
                      <Input
                        value={editForm.school_name}
                        onChange={(e) =>
                          handleInputChange('school_name', e.target.value)
                        }
                        className={`w-full ${formErrors.school_name ? 'border-red-500' : ''}`}
                        placeholder='Enter school name'
                      />
                      {formErrors.school_name && (
                        <p className='mt-1 text-xs text-red-500'>
                          {formErrors.school_name}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span>{user_info.school_name}</span>
                  )}
                </div>

                <div className='flex items-center gap-2'>
                  <Calendar className='text-muted-foreground h-4 w-4' />
                  <span className='font-medium'>Joined:</span>
                  <span>{formatDate(user_info.created_at)}</span>
                </div>

                {/* Birth Date */}
                <div className='flex items-center gap-2'>
                  <Calendar className='text-muted-foreground h-4 w-4' />
                  <span className='font-medium'>Birth Date:</span>
                  {isEditing ? (
                    <div className='ml-auto flex-1'>
                      <Input
                        type='date'
                        value={editForm.birth}
                        onChange={(e) =>
                          handleInputChange('birth', e.target.value)
                        }
                        className='w-full'
                        placeholder='Select birth date'
                      />
                    </div>
                  ) : (
                    <span>
                      {user_info.birth
                        ? moment(user_info.birth).format('DD/MM/YYYY')
                        : 'Not provided'}
                    </span>
                  )}
                </div>

                {/* Address */}
                <div className='flex items-center gap-2'>
                  <MapPin className='text-muted-foreground h-4 w-4' />
                  <span className='font-medium'>Address:</span>
                  {isEditing ? (
                    <div className='ml-auto flex-1'>
                      <Input
                        value={editForm.address}
                        onChange={(e) =>
                          handleInputChange('address', e.target.value)
                        }
                        className='w-full'
                        placeholder='Enter address'
                      />
                    </div>
                  ) : (
                    <span>{user_info.address || 'Not provided'}</span>
                  )}
                </div>

                {/* Parent Information Section */}
                <div className='border-t border-gray-200 pt-2 dark:border-gray-700'>
                  <h4 className='mb-3 text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Parent Information
                  </h4>

                  {/* Parent Phone Number */}
                  <div className='mb-2 flex items-center gap-2'>
                    <CreditCard className='text-muted-foreground h-4 w-4' />
                    <span className='text-sm font-medium'>Parent Phone:</span>
                    {isEditing ? (
                      <div className='ml-auto flex-1'>
                        <Input
                          value={editForm.parent_phone_number}
                          onChange={(e) =>
                            handleInputChange(
                              'parent_phone_number',
                              e.target.value
                            )
                          }
                          className='w-full'
                          placeholder='Enter phone number'
                        />
                      </div>
                    ) : (
                      <span className='text-sm'>
                        {user_info.parent?.phone_number || 'Not provided'}
                      </span>
                    )}
                  </div>

                  {/* Parent Email */}
                  <div className='mb-2 flex items-center gap-2'>
                    <Mail className='text-muted-foreground h-4 w-4' />
                    <span className='text-sm font-medium'>Parent Email:</span>
                    {isEditing ? (
                      <div className='ml-auto flex-1'>
                        <Input
                          type='email'
                          value={editForm.parent_email}
                          onChange={(e) =>
                            handleInputChange('parent_email', e.target.value)
                          }
                          className='w-full'
                          placeholder='Enter parent email'
                        />
                      </div>
                    ) : (
                      <span className='text-sm'>
                        {user_info.parent?.email || 'Not provided'}
                      </span>
                    )}
                  </div>

                  {/* Parent Relationship */}
                  <div className='flex items-center gap-2'>
                    <User className='text-muted-foreground h-4 w-4' />
                    <span className='text-sm font-medium'>Relationship:</span>
                    {isEditing ? (
                      <div className='ml-auto flex-1'>
                        <Input
                          value={editForm.parent_relationship}
                          onChange={(e) =>
                            handleInputChange(
                              'parent_relationship',
                              e.target.value
                            )
                          }
                          className='w-full'
                          placeholder='e.g., Father, Mother, Guardian'
                        />
                      </div>
                    ) : (
                      <span className='text-sm'>
                        {user_info.parent?.relationship || 'Not provided'}
                      </span>
                    )}
                  </div>
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
                  <BookOpen className='text-muted-foreground h-8 w-8' />
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
                  <Clock className='text-muted-foreground h-8 w-8' />
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
                  <Calendar className='text-muted-foreground h-8 w-8' />
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
                <div className='bg-muted/50 rounded-lg p-4 text-center'>
                  <p className='text-2xl font-bold'>
                    {reading_statistics.english_read_books_count}
                  </p>
                  <p className='text-muted-foreground text-sm'>English Books</p>
                </div>
                <div className='bg-muted/50 rounded-lg p-4 text-center'>
                  <p className='text-2xl font-bold'>
                    {reading_statistics.malay_read_books_count}
                  </p>
                  <p className='text-muted-foreground text-sm'>Malay Books</p>
                </div>
                <div className='bg-muted/50 rounded-lg p-4 text-center'>
                  <p className='text-2xl font-bold'>
                    {reading_statistics.mandarin_read_books_count}
                  </p>
                  <p className='text-muted-foreground text-sm'>
                    Mandarin Books
                  </p>
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
