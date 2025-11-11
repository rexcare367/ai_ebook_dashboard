'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { School, User } from '@/constants/data';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import axiosInstance from '@/lib/axios';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const formSchema = z.object({
  name: z.string(),
  ic_number: z.string(),
  school: z.string(),
  school_id: z.string().optional()
});

export default function UserForm({
  initialData,
  pageTitle
}: {
  initialData: User | null;
  pageTitle: string;
}) {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues = {
    name: initialData?.name || '',
    ic_number: initialData?.ic_number || '',
    school: '',
    school_id: initialData?.school_id || ''
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: defaultValues
  });

  useEffect(() => {
    // Fetch schools list
    axiosInstance
      .get('/schools', {
        params: {
          page: 1,
          perPage: 100, // Get all schools
          status: 'active'
        }
      })
      .then((res) => {
        if (res.data.success) {
          const schoolsList = res.data.data.schools || [];
          setSchools(schoolsList);

          // If we have initialData with school_id, find and set the school name
          if (initialData?.school_id) {
            const userSchool = schoolsList.find(
              (school: School) => school.id === initialData.school_id
            );
            if (userSchool) {
              form.setValue('school', userSchool.name);
            }
          }
        } else {
          throw new Error('Failed to fetch schools');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch schools:', err);
        toast.error('Failed to load schools list');
      });
  }, [initialData, form]);

  // Helper function to format datetime
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      if (initialData) {
        // Update user
        await axiosInstance.patch(`/users/by_id/${initialData.id}`, values);
        toast.success('User updated successfully!', {
          description: `${values.name} has been updated in the system.`
        });
      } else {
        // Create user
        await axiosInstance.post(`/users`, values);
        toast.success('User created successfully!', {
          description: `${values.name} has been added to the system.`
        });
        // Reset form after successful creation
        form.reset();
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'An unexpected error occurred';
      toast.error(
        initialData ? 'Failed to update user' : 'Failed to create user',
        {
          description: errorMessage
        }
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
        {initialData && (
          <div className='text-muted-foreground space-y-1 text-sm'>
            <p>Created: {formatDateTime(initialData.created_at)}</p>
            <p>Last Updated: {formatDateTime(initialData.updated_at)}</p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter user name'
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='ic_number'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IC Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter IC number'
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='school'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School</FormLabel>
                    <Select
                      onValueChange={(value: string) => {
                        field.onChange(value);
                        // Find the selected school and set the school_id
                        const selectedSchool = schools.find(
                          (school) => school.name === value
                        );
                        if (selectedSchool) {
                          form.setValue('school_id', selectedSchool.id);
                        }
                      }}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select school' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {schools &&
                          schools.map((school, i) => (
                            <SelectItem key={i} value={school.name}>
                              {school.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type='submit' disabled={isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {initialData ? 'Update User' : 'Create User'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
