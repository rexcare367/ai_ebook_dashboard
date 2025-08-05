'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Text, XCircle } from 'lucide-react';
// import Image from 'next/image';
import { CellAction } from './cell-action';
import { CATEGORY_OPTIONS } from './options';
import { School } from '@/constants/data';
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

export const columns: ColumnDef<School>[] = [
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
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<School, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<School['name']>()}</div>,
    meta: {
      label: 'Name',
      placeholder: 'Search Name...',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    id: 'state',
    accessorKey: 'state',
    header: ({ column }: { column: Column<School, unknown> }) => (
      <DataTableColumnHeader column={column} title='State' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<School['state']>()}</div>,
    meta: {
      label: 'State',
      placeholder: 'Search State...',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    id: 'city',
    accessorKey: 'city',
    header: ({ column }: { column: Column<School, unknown> }) => (
      <DataTableColumnHeader column={column} title='City' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<School['city']>()}</div>,
    meta: {
      label: 'City',
      placeholder: 'Search City...',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    id: 'students_count',
    accessorKey: 'students_count',
    header: ({ column }: { column: Column<School, unknown> }) => (
      <DataTableColumnHeader column={column} title='students_count' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<School['students_count']>();
      return (
        <Badge variant='outline' className='capitalize'>
          {status}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ cell }) => {
      const status = cell.getValue<School['status']>();
      return (
        <Badge
          variant={status === 'active' ? 'default' : 'secondary'}
          className='capitalize'
        >
          {status}
        </Badge>
      );
    }
  },
  // {
  //   accessorKey: 'school',
  //   header: 'School',
  //   cell: ({ cell }) => <div>{cell.getValue<School['school']>()}</div>
  // },
  // {
  //   accessorKey: 'createdAt',
  //   header: 'Created At',
  //   cell: ({ cell }) => {
  //     const date = cell.getValue<School['createdAt']>();
  //     return (
  //       <div className='text-muted-foreground text-sm'>
  //         {formatDateTime(date)}
  //       </div>
  //     );
  //   }
  // },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: ({ cell }) => {
      const date = cell.getValue<School['created_at']>();
      return (
        <div className='text-muted-foreground text-sm'>
          {formatDateTime(date)}
        </div>
      );
    }
  },

  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
