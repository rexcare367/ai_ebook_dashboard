'use client';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Text } from 'lucide-react';
import { CellAction } from './cell-action';
import { User } from '@/constants/data';

// Base columns that are common to both views (excluding actions)
const getBaseColumns = (): ColumnDef<User>[] => [
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
  }
];

// Actions column factory
const getActionsColumn = (
  showStatisticsAction: boolean = false
): ColumnDef<User> => ({
  id: 'actions',
  cell: ({ row }) => (
    <CellAction
      data={row.original}
      showStatisticsAction={showStatisticsAction}
    />
  )
});

// Additional columns for registered users
const registeredUserColumns: ColumnDef<User>[] = [
  {
    id: 'birth',
    accessorKey: 'birth',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Birth Date' />
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
    id: 'parent-phone-number',
    accessorKey: 'parent.phone_number',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Parent Phone Number' />
    ),
    cell: ({ row }) => <div>{row.original.parent?.phone_number || 'N/A'}</div>
  }
];

// Function to get columns based on view type
export const getColumns = (
  showRegisteredOnly: boolean = false,
  onRowClick?: (user: User) => void,
  showStatisticsAction: boolean = false
): ColumnDef<User>[] => {
  // Create columns with optional row click handler
  const createColumnsWithRowClick = (
    columns: ColumnDef<User>[]
  ): ColumnDef<User>[] => {
    if (!onRowClick) return columns;

    return columns.map((column) => ({
      ...column,
      cell: (props) => {
        const originalCell =
          typeof column.cell === 'function' ? column.cell(props) : column.cell;

        // Don't add click handler to actions column
        if (column.id === 'actions') {
          return originalCell;
        }

        return (
          <div
            className='hover:bg-muted/50 -m-2 cursor-pointer rounded p-2'
            onClick={() => onRowClick(props.row.original)}
          >
            {originalCell}
          </div>
        );
      }
    }));
  };

  const baseColumns = getBaseColumns();
  const actionsColumn = getActionsColumn(showStatisticsAction);

  if (showRegisteredOnly) {
    // For registered users, include all columns
    const registeredColumns = [
      ...baseColumns,
      ...registeredUserColumns,
      actionsColumn
    ];
    return createColumnsWithRowClick(registeredColumns);
  } else {
    // For all users, only show base columns
    const allColumns = [...baseColumns, actionsColumn];
    return createColumnsWithRowClick(allColumns);
  }
};

// Export the original columns for backward compatibility
export const columns: ColumnDef<User>[] = [
  ...getBaseColumns(),
  getActionsColumn()
];
