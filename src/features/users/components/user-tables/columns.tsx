'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Text, XCircle } from 'lucide-react';
import Image from 'next/image';
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

// Base columns that are common to both views
const baseColumns: ColumnDef<User>[] = [
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
  {
    id: 'email',
    accessorKey: 'email',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<User['email']>()}</div>
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];

// Additional columns for registered users
const registeredUserColumns: ColumnDef<User>[] = [
  {
    id: 'birth',
    accessorKey: 'birth',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='birth' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<User['birth']>()}</div>
  },
  {
    id: 'address',
    accessorKey: 'address',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Address' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<User['address']>()}</div>
  },
  {
    id: 'year',
    accessorKey: 'year',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='year' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<User['birth']>()}</div>
  },
  {
    id: 'parent-phone-number',
    accessorKey: 'parent-phone-number',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='parent phone number' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<User['address']>()}</div>
  }
];

// Function to get columns based on view type
export const getColumns = (
  showRegisteredOnly: boolean = false
): ColumnDef<User>[] => {
  if (showRegisteredOnly) {
    // For registered users, include email and address columns
    return [
      ...baseColumns.slice(0, -1), // All base columns except actions
      ...registeredUserColumns, // Add email and address
      baseColumns[baseColumns.length - 1] // Add actions back
    ];
  } else {
    // For all users, only show base columns (no email/address)
    return baseColumns;
  }
};

// Export the original columns for backward compatibility
export const columns: ColumnDef<User>[] = baseColumns;
