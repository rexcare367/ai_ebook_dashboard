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
import { Admin } from '@/constants/data';
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
  email: z.string().email({
    message: 'Please enter a valid email address.'
  }),
  role: z.string().min(1, {
    message: 'Please select a role.'
  }),
  current_role: z.string().optional(),
  status: z.string().min(1, {
    message: 'Please select a status.'
  }),
  school: z.string(),
  school_id: z.string().optional()
});

export default function AdminForm({
  initialData,
  pageTitle
}: {
  initialData: Admin | null;
  pageTitle: string;
}) {
  const [schools, setSchools] = useState<Array<string>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch schools list
    axiosInstance
      .get('/admins/schools')
      .then((res) => {
        setSchools(res.data.data.schools);
      })
      .catch((err) => {
        console.error('Failed to fetch schools:', err);
        toast.error('Failed to load schools list');
      });
  }, []);

  const defaultValues = {
    name: initialData?.name || '',
    email: initialData?.email || '',
    role: initialData?.role || '',
    current_role: initialData?.current_role || initialData?.role || '',
    status: initialData?.status || '',
    school: initialData?.school?.name || '',
    school_id: initialData?.school_id || ''
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: defaultValues
  });

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
        // Update admin
        await axiosInstance.put(`/admins/${initialData.id}`, values);
        toast.success('Admin updated successfully!', {
          description: `${values.name} has been updated in the system.`
        });
      } else {
        await fetch('/api/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: values.email,
            username: values.email.split('@')[0].replace(/[^a-zA-Z]/g, '')
          })
        });

        // Create admin
        await axiosInstance.post(`/admins`, values);
        toast.success('Admin created successfully!', {
          description: `${values.name} has been added to the system.`
        });
        // Reset form after successful creation
        form.reset();
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'An unexpected error occurred';
      toast.error(
        initialData ? 'Failed to update admin' : 'Failed to create admin',
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
            <p>Created: {formatDateTime(initialData.createdAt)}</p>
            <p>Last Updated: {formatDateTime(initialData.updatedAt)}</p>
            <p>Last Login: {formatDateTime(initialData.last_login)}</p>
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
                    <FormLabel>Admin Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter admin name'
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
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='Enter email address'
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
                name='role'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select role' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='admin'>Admin</SelectItem>
                        <SelectItem value='school_manager'>
                          School Manager
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='current_role'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select current role' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='admin'>Admin</SelectItem>
                        <SelectItem value='school_manager'>
                          School Manager
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='school_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter school ID'
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
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='active'>Active</SelectItem>
                        <SelectItem value='inactive'>Inactive</SelectItem>
                        <SelectItem value='pending'>Pending</SelectItem>
                      </SelectContent>
                    </Select>
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
                      onValueChange={field.onChange}
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
                            <SelectItem key={i} value={school}>
                              {school}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div
              id='clerk-captcha'
              data-cl-theme='auto'
              data-cl-size='normal'
              data-cl-language='auto'
            />
            <Button type='submit' disabled={isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {initialData ? 'Update Admin' : 'Create Admin'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
