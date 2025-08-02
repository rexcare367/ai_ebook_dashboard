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
import { School } from '@/constants/data';
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
  state: z.string(),
  city: z.string(),
  status: z.string().min(1, {
    message: 'Please select a status.'
  })
});

export default function SchoolForm({
  initialData,
  pageTitle
}: {
  initialData: School | null;
  pageTitle: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues = {
    name: initialData?.name || '',
    state: initialData?.state || '',
    city: initialData?.city || '',
    status: initialData?.status || ''
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
        await axiosInstance.patch(`/schools/${initialData.id}`, values);
        toast.success('School updated successfully!', {
          description: `${values.name} has been updated in the system.`
        });
      } else {
        // Create school
        await axiosInstance.post(`/schools`, values);
        toast.success('School created successfully!', {
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
                    <FormLabel>School Name</FormLabel>
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
                name='state'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='Enter state'
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
                name='city'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='Enter city'
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
            </div>
            <Button type='submit' disabled={isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {initialData ? 'Update School' : 'Create School'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
