'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Text, XCircle } from 'lucide-react';
// import Image from 'next/image';
import { CellAction } from './cell-action';
import { CATEGORY_OPTIONS } from './options';
import { Admin } from '@/constants/data';
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

export const columns: ColumnDef<Admin>[] = [
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
    header: ({ column }: { column: Column<Admin, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Admin['name']>()}</div>,
    meta: {
      label: 'Name',
      placeholder: 'Search Name...',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: ({ column }: { column: Column<Admin, unknown> }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Admin['email']>()}</div>,
    meta: {
      label: 'Email',
      placeholder: 'Search Email...',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    id: 'role',
    accessorKey: 'role',
    header: ({ column }: { column: Column<Admin, unknown> }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ cell }) => {
      const role = cell.getValue<Admin['role']>();
      return (
        <Badge variant='outline' className='capitalize'>
          {role}
        </Badge>
      );
    }
    // enableColumnFilter: true,
    // meta: {
    //   label: 'Role',
    //   variant: 'multiSelect',
    //   options: CATEGORY_OPTIONS
    // }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ cell }) => {
      const status = cell.getValue<Admin['status']>();
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
  {
    accessorKey: 'school',
    header: 'School',
    cell: ({ cell }) => {
      const school = cell.getValue<Admin['school']>();
      return <div>{school?.name || 'No School'}</div>;
    }
  },
  {
    accessorKey: 'school_id',
    header: 'School ID',
    cell: ({ cell }) => <div>{cell.getValue<Admin['school_id']>()}</div>
  },
  {
    accessorKey: 'createdAt',
    header: 'Timestamp',
    cell: ({ cell }) => {
      const date = cell.getValue<Admin['createdAt']>();
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
