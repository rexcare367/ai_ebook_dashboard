import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

interface UserStatusIndicatorProps {
  status: string;
  className?: string;
  showDetails?: boolean;
}

const statusConfig = {
  active: {
    icon: Icons.check,
    label: 'Active',
    description:
      'Your account is fully active and you have access to all features.',
    color:
      'bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-800',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  inactive: {
    icon: Icons.spinner,
    label: 'Pending',
    description:
      'Your account is under review. You will be notified once approved.',
    color:
      'bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-800',
    iconColor: 'text-yellow-600 dark:text-yellow-400'
  },
  disabled: {
    icon: Icons.user,
    label: 'Inactive',
    description:
      'Your account has been deactivated. Please contact support for assistance.',
    color:
      'bg-red-500/10 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-800',
    iconColor: 'text-red-600 dark:text-red-400'
  },
  suspended: {
    icon: Icons.warning,
    label: 'Suspended',
    description:
      'Your account has been temporarily suspended. Please review our terms of service.',
    color:
      'bg-orange-500/10 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-800',
    iconColor: 'text-orange-600 dark:text-orange-400'
  }
};

export function UserStatusIndicator({
  status,
  className,
  showDetails = true
}: UserStatusIndicatorProps) {
  const config =
    statusConfig[status.toLowerCase() as keyof typeof statusConfig] ||
    statusConfig.inactive;
  const IconComponent = config.icon;

  if (!showDetails) {
    return (
      <Badge
        variant='outline'
        className={cn(
          'flex items-center gap-1.5 px-2 py-1 text-xs font-medium',
          config.color,
          className
        )}
      >
        <IconComponent className={cn('h-3 w-3', config.iconColor)} />
        {config.label}
      </Badge>
    );
  }

  return (
    <Card
      className={cn('border-l-4 border-l-current', config.color, className)}
    >
      <CardContent className='p-4'>
        <div className='flex items-start gap-3'>
          <div
            className={cn('rounded-full bg-current/10 p-2', config.iconColor)}
          >
            <IconComponent className='h-5 w-5' />
          </div>
          <div className='flex-1 space-y-1'>
            <div className='flex items-center gap-2'>
              <h3 className='text-sm font-semibold'>{config.label}</h3>
              <Badge
                variant='outline'
                className={cn('text-xs font-medium', config.color)}
              >
                {status}
              </Badge>
            </div>
            <p className='text-sm leading-relaxed opacity-80'>
              {config.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
