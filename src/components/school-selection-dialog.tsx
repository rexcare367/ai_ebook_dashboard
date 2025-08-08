'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, Users } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { useUserStore } from '@/utils/user-store';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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

interface SchoolSelectionDialogProps {
  children: React.ReactNode;
}

/**
 * School Selection Dialog Component
 *
 * This component allows admins to switch between admin and school_manager roles.
 *
 * Persistence Mechanism:
 * 1. When a school is selected, the component calls the backend API to update
 *    the user's current_role, school, and school_id in the database
 * 2. The backend API endpoint is: PUT /admins/{user.id}
 * 3. After successful backend update, the local user state is updated
 * 4. A hard page refresh is triggered to ensure all components reflect the changes
 * 5. On page load, the DashboardUserProvider fetches fresh user data from the backend
 *
 * This ensures that role changes persist across page refreshes and browser sessions.
 */
export function SchoolSelectionDialog({
  children
}: SchoolSelectionDialogProps) {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const { user, updateUser } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetchSchools();
    }
  }, [isOpen]);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/schools', {
        params: {
          page: 1,
          perPage: 100, // Get all schools
          status: 'active'
        }
      });

      if (response.data.success) {
        setSchools(response.data.data.schools || []);
      } else {
        throw new Error('Failed to fetch schools');
      }
    } catch (error) {
      console.error('Failed to fetch schools:', error);
      toast.error('Failed to load schools. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Validate backend API connection
  const validateBackendConnection = async () => {
    try {
      const response = await axiosInstance.get('/admins/health');
      return response.data.success;
    } catch (error) {
      console.error('Backend connection failed:', error);
      return false;
    }
  };

  const handleSchoolSelect = async (school: School) => {
    if (!user) return;

    setIsSwitching(true);
    try {
      // First, update in backend to ensure persistence
      const response = await axiosInstance.put(`/admins/${user.id}`, {
        current_role: 'school_manager',
        school_id: school.id
      });

      // Verify the backend update was successful
      if (!response.data.success) {
        throw new Error('Backend update failed');
      }

      // Update local state with the response data if available
      const updatedUser = {
        ...user,
        current_role: 'school_manager',
        school: school,
        school_id: school.id
      };

      // Update local state
      updateUser(updatedUser);

      toast.success(`Switched to ${school.name} as School Manager`);
      setIsOpen(false);

      // Force a hard refresh to ensure all components update
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to switch role:', error);
      toast.error('Failed to switch role. Please try again.');
    } finally {
      setIsSwitching(false);
    }
  };

  const handleSwitchBackToAdmin = async () => {
    if (!user) return;

    setIsSwitching(true);
    try {
      // First, update in backend to ensure persistence
      const response = await axiosInstance.put(`/admins/${user.id}`, {
        current_role: 'admin',
        school_id: null
      });

      // Verify the backend update was successful
      if (!response.data.success) {
        throw new Error('Backend update failed');
      }

      // Update local state with the response data if available
      const updatedUser = {
        ...user,
        current_role: 'admin',
        school: null,
        school_id: ''
      };

      // Update local state
      updateUser(updatedUser);

      toast.success('Switched back to Admin role');
      setIsOpen(false);

      // Force a hard refresh to ensure all components update
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to switch role:', error);
      toast.error('Failed to switch role. Please try again.');
    } finally {
      setIsSwitching(false);
    }
  };

  // Only show for admin users (base role must be admin)
  if (!user || user.role !== 'admin') {
    return null;
  }

  // Ensure user has current_role field, default to role if not present
  const currentRole = user.current_role || user.role;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>
            {currentRole === 'school_manager'
              ? 'Switch School or Return to Admin'
              : 'Switch to School Manager'}
          </DialogTitle>
          <DialogDescription>
            {currentRole === 'school_manager'
              ? 'Select another school to switch to, or switch back to Admin role.'
              : 'Select a school to switch to School Manager role. You can switch back to Admin role anytime.'}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {currentRole === 'school_manager' && (
            <Card className='border-blue-200 bg-blue-50'>
              <CardHeader>
                <CardTitle className='text-blue-800'>
                  Currently Managing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='font-medium'>
                      {user.school?.name || 'Unknown School'}
                    </p>
                    <p className='text-sm text-blue-600'>School Manager</p>
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      onClick={handleSwitchBackToAdmin}
                      disabled={isSwitching}
                      variant='outline'
                      size='sm'
                    >
                      {isSwitching && (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      )}
                      Switch Back to Admin
                    </Button>
                    <Button
                      onClick={() => setIsOpen(true)}
                      disabled={isSwitching}
                      variant='outline'
                      size='sm'
                    >
                      Switch to Another School
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {(currentRole === 'admin' || currentRole === 'school_manager') && (
            <>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-medium'>
                  {currentRole === 'school_manager'
                    ? 'Select Another School'
                    : 'Select a School'}
                </h3>
                {loading && <Loader2 className='h-4 w-4 animate-spin' />}
              </div>

              <div className='grid max-h-[400px] gap-3 overflow-y-auto'>
                {schools
                  .filter((school) => {
                    // If user is currently a school manager, filter out their current school
                    if (
                      currentRole === 'school_manager' &&
                      user.school?.id === school.id
                    ) {
                      return false;
                    }
                    return true;
                  })
                  .map((school) => (
                    <Card
                      key={school.id}
                      className='cursor-pointer transition-colors hover:bg-gray-50'
                      onClick={() => handleSchoolSelect(school)}
                    >
                      <CardContent className='p-4'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-3'>
                            <Building2 className='h-5 w-5 text-gray-500' />
                            <div>
                              <h4 className='font-medium'>{school.name}</h4>
                              <p className='text-sm text-gray-500'>
                                {school.city}, {school.state}
                              </p>
                            </div>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <div className='flex items-center space-x-1'>
                              <Users className='h-4 w-4 text-gray-400' />
                              <span className='text-sm text-gray-500'>
                                {school.students_count} students
                              </span>
                            </div>
                            <Badge variant='secondary' className='capitalize'>
                              {school.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {schools.filter((school) => {
                // If user is currently a school manager, filter out their current school
                if (
                  currentRole === 'school_manager' &&
                  user.school?.id === school.id
                ) {
                  return false;
                }
                return true;
              }).length === 0 &&
                !loading && (
                  <div className='py-8 text-center text-gray-500'>
                    {currentRole === 'school_manager'
                      ? 'No other schools available to switch to'
                      : 'No schools available'}
                  </div>
                )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
