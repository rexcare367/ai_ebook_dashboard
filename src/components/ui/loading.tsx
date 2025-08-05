import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  className?: string;
  text?: string;
}

export function Loading({
  size = 'md',
  variant = 'spinner',
  className,
  text
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const renderSpinner = () => (
    <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
  );

  const renderDots = () => (
    <div className={cn('flex space-x-1', className)}>
      <div
        className={cn(
          'h-2 w-2 animate-bounce rounded-full bg-current',
          sizeClasses[size]
        )}
      />
      <div
        className={cn(
          'h-2 w-2 animate-bounce rounded-full bg-current',
          sizeClasses[size]
        )}
        style={{ animationDelay: '0.1s' }}
      />
      <div
        className={cn(
          'h-2 w-2 animate-bounce rounded-full bg-current',
          sizeClasses[size]
        )}
        style={{ animationDelay: '0.2s' }}
      />
    </div>
  );

  const renderPulse = () => (
    <div
      className={cn(
        'animate-pulse rounded bg-current',
        sizeClasses[size],
        className
      )}
    />
  );

  const renderContent = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className='flex items-center justify-center space-x-2'>
      {renderContent()}
      {text && <span className='text-muted-foreground text-sm'>{text}</span>}
    </div>
  );
}

// Convenience components for common use cases
export function LoadingSpinner({
  size,
  className,
  text
}: Omit<LoadingProps, 'variant'>) {
  return (
    <Loading size={size} variant='spinner' className={className} text={text} />
  );
}

export function LoadingDots({
  size,
  className,
  text
}: Omit<LoadingProps, 'variant'>) {
  return (
    <Loading size={size} variant='dots' className={className} text={text} />
  );
}

export function LoadingPulse({
  size,
  className,
  text
}: Omit<LoadingProps, 'variant'>) {
  return (
    <Loading size={size} variant='pulse' className={className} text={text} />
  );
}
