import { cn } from '@/lib/utils';
import CustomSignInForm from './custom-sign-in-form';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ModeToggle } from '@/components/layout/ThemeToggle/theme-toggle';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignInViewPage() {
  return (
    <div className='bg-background text-foreground relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='absolute top-4 right-4 flex items-center gap-2 md:top-8 md:right-8'></div>
      <div className='bg-muted relative hidden h-full flex-col p-10 lg:flex dark:border-r'>
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <Image src='/assets/logo.png' alt='sponser' width={120} height={50} />
        </div>
        <div className='inset-0 flex h-full items-center justify-center'>
          <div className='h-fit w-full'>
            <Image
              className='w-full rounded-4xl'
              src='/assets/sponsor1.png'
              alt='sponser'
              width={1000}
              height={1000}
            />
          </div>
        </div>
        <div className='relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>
              &ldquo;The more that you read, the more things you will know. The
              more that you learn, the more places you will go.&rdquo;
            </p>
            <footer className='text-sm'>Dr. Seuss</footer>
          </blockquote>
        </div>
      </div>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='bg-muted flex h-full w-full max-w-md flex-col items-center justify-center space-y-6 rounded-4xl border-1 border-white/50 p-4 dark:bg-black/10'>
          <Link
            className={cn(
              'group text-foreground inline-flex hover:text-yellow-200'
            )}
            target='_blank'
            href={'https://github.com/kiranism/next-shadcn-dashboard-starter'}
          >
            <div className='ml-2 flex items-center gap-1 text-2xl md:flex'>
              <span className='font-display font-medium'>Sign in</span>
            </div>
          </Link>
          <CustomSignInForm />
          <div className='text-foreground w-full text-center text-sm'>
            Don&apos;t have an account?{' '}
            <Link href='/auth/sign-up' className='hover:text-primary underline'>
              Sign up
            </Link>
          </div>

          <p className='text-muted-foreground px-8 text-center text-sm'>
            By clicking continue, you agree to our{' '}
            <Link
              href='/terms'
              className='hover:text-primary underline underline-offset-4'
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href='/privacy'
              className='hover:text-primary underline underline-offset-4'
            >
              Privacy Policy
            </Link>
            .
          </p>
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
