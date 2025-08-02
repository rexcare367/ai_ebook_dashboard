import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { IUser } from '@/types';

interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
  user: {
    imageUrl?: string;
    fullName?: string | null;
    emailAddresses: Array<{ emailAddress: string }>;
  } | null;
  userProfile?: IUser | null;
}

export function UserAvatarProfile({
  className,
  showInfo = false,
  user,
  userProfile
}: UserAvatarProfileProps) {
  return (
    <div className='flex items-center gap-2'>
      <Avatar className={className}>
        <AvatarImage src={user?.imageUrl || ''} alt={user?.fullName || ''} />
        <AvatarFallback className='rounded-lg'>
          {user?.fullName?.slice(0, 2)?.toUpperCase() || 'CN'}
        </AvatarFallback>
      </Avatar>

      {showInfo && (
        <div className='grid flex-1 text-left text-sm leading-tight'>
          {/* <span className='truncate font-semibold'>{user?.fullName || ''}</span> */}
          <span className='truncate text-xs'>
            {user?.emailAddresses[0].emailAddress || ''}
          </span>
          <span className='truncate font-semibold'>
            {userProfile?.role || ''}
          </span>
        </div>
      )}
    </div>
  );
}
