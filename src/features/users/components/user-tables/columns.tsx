'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Text, XCircle } from 'lucide-react';
// import Image from 'next/image';
import { CellAction } from './cell-action';
import { CATEGORY_OPTIONS } from './options';
import { User } from '@/constants/data';
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

export const columns: ColumnDef<User>[] = [
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
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<User['name']>()}</div>,
    meta: {
      label: 'Name',
      placeholder: 'Search Name...',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    id: 'registration_status',
    accessorKey: 'registration_status',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ cell }) => (
      <div>{cell.getValue<User['registration_status']>()}</div>
    )
  },
  {
    id: 'ic_number',
    accessorKey: 'ic_number',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='IC Number' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<User['ic_number']>()}</div>,
    meta: {
      label: 'ic_number',
      placeholder: 'Search ic_number...',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  // {
  //   id: 'status',
  //   accessorKey: 'status',
  //   header: ({ column }: { column: Column<User, unknown> }) => (
  //     <DataTableColumnHeader column={column} title='Status' />
  //   ),
  //   cell: ({ cell }) => {
  //     const status = cell.getValue<User['status']>();
  //     return (
  //       <Badge variant='outline' className='capitalize'>
  //         {status}
  //       </Badge>
  //     );
  //   },
  //   enableColumnFilter: true,
  //   meta: {
  //     label: 'Status',
  //     variant: 'multiSelect',
  //     options: CATEGORY_OPTIONS
  //   }
  // },
  // {
  //   accessorKey: 'status',
  //   header: 'Status',
  //   cell: ({ cell }) => {
  //     const status = cell.getValue<User['status']>();
  //     return (
  //       <Badge
  //         variant={status === 'active' ? 'default' : 'secondary'}
  //         className='capitalize'
  //       >
  //         {status}
  //       </Badge>
  //     );
  //   }
  // },
  // {
  //   accessorKey: 'school',
  //   header: 'User',
  //   cell: ({ cell }) => <div>{cell.getValue<User['school']>()}</div>
  // },
  // {
  //   accessorKey: 'createdAt',
  //   header: 'Created At',
  //   cell: ({ cell }) => {
  //     const date = cell.getValue<User['createdAt']>();
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
      const date = cell.getValue<User['created_at']>();
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
