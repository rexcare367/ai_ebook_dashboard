'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Text, XCircle } from 'lucide-react';
// import Image from 'next/image';
import { CellAction } from './cell-action';
import { CATEGORY_OPTIONS } from './options';
import { AnalysisResult } from '@/constants/data';
import { format, parseISO } from 'date-fns';

// Helper function to format datetime
const formatDateTime = (dateString: string | null) => {
  if (!dateString) return 'Never';
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
  } catch {
    return 'Invalid date';
  }
};

export const columns: ColumnDef<AnalysisResult>[] = [
  // {
  //   accessorKey: 'photo_url',
  //   header: 'IMAGE',
  //   cell: ({ row }) => {
  //     return (
  //       <div className='relative aspect-square'>
  //         <Image
  //           src={row.getValue('photo_url')}
  //           alt={row.getValue('name')}
  //           fill
  //           className='rounded-lg'
  //         />
  //       </div>
  //     );
  //   }
  // },
  {
    id: 'school_name',
    accessorKey: 'school_name',
    header: ({ column }: { column: Column<AnalysisResult, unknown> }) => (
      <DataTableColumnHeader column={column} title='School' />
    ),
    cell: ({ cell }) => (
      <div>{cell.getValue<AnalysisResult['school_name']>()}</div>
    ),
    meta: {
      label: 'Name',
      placeholder: 'Search Name...',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    id: 'total_students',
    accessorKey: 'total_students',
    header: ({ column }: { column: Column<AnalysisResult, unknown> }) => (
      <DataTableColumnHeader column={column} title='Total Students' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<AnalysisResult['total_students']>();
      return (
        <Badge variant='outline' className='capitalize'>
          {status}
        </Badge>
      );
    }
  },
  {
    id: 'count_of_registered_students',
    accessorKey: 'count_of_registered_students',
    header: ({ column }: { column: Column<AnalysisResult, unknown> }) => (
      <DataTableColumnHeader
        column={column}
        title='Total Registered Students'
      />
    ),
    cell: ({ cell }) => {
      const status =
        cell.getValue<AnalysisResult['count_of_registered_students']>();
      return (
        <Badge variant='outline' className='capitalize'>
          {status}
        </Badge>
      );
    }
  },
  {
    id: 'count_of_active_students',
    accessorKey: 'count_of_active_students',
    header: ({ column }: { column: Column<AnalysisResult, unknown> }) => (
      <DataTableColumnHeader column={column} title='Active Students ' />
    ),
    cell: ({ cell }) => {
      const status =
        cell.getValue<AnalysisResult['count_of_active_students']>();
      return (
        <Badge variant='outline' className='capitalize'>
          {status}
        </Badge>
      );
    }
  },
  {
    id: 'percent_of_registered_students',
    accessorKey: 'percent_of_registered_students',
    header: ({ column }: { column: Column<AnalysisResult, unknown> }) => (
      <DataTableColumnHeader column={column} title='Registration Rate' />
    ),
    cell: ({ cell }) => {
      const status =
        cell.getValue<AnalysisResult['percent_of_registered_students']>();
      return (
        <Badge variant='outline' className='capitalize'>
          {status}%
        </Badge>
      );
    }
  },
  {
    id: 'percent_of_active_students',
    accessorKey: 'percent_of_active_students',
    header: ({ column }: { column: Column<AnalysisResult, unknown> }) => (
      <DataTableColumnHeader column={column} title='Usage Rate' />
    ),
    cell: ({ cell }) => {
      const status =
        cell.getValue<AnalysisResult['percent_of_active_students']>();
      return (
        <Badge variant='outline' className='capitalize'>
          {status}%
        </Badge>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
