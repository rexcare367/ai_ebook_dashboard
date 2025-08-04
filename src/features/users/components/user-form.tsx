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
import { User } from '@/constants/data';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import axiosInstance from '@/lib/axios';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  malaysiaStatesAndCities,
  getRandomState,
  getRandomCity,
  type MalaysiaState
} from '@/constants/malaysia-locations';

const formSchema = z.object({
  name: z.string(),
  ic_number: z.string(),
  school_id: z.string(),
  registration_status: z.string()
});

export default function UserForm({
  initialData,
  pageTitle
}: {
  initialData: User | null;
  pageTitle: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues = {
    name: initialData?.name || '',
    ic_number: initialData?.ic_number || '',
    school_id: initialData?.school_id || '',
    registration_status: initialData?.registration_status || 'active'
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
        // Update school
        await axiosInstance.patch(`/users/by_id/${initialData.id}`, values);
        toast.success('User updated successfully!', {
          description: `${values.name} has been updated in the system.`
        });
      } else {
        // Create school
        await axiosInstance.post(`/schools`, values);
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
        initialData ? 'Failed to update school' : 'Failed to create school',
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
                        placeholder='Enter school name'
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
                    <FormLabel>ic_number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter ic_number'
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
                name='school_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>school_id</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter school name'
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
                name='registration_status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>registration_status</FormLabel>
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
