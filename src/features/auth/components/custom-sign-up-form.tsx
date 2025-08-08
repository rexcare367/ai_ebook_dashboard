'use client';
import { useSignUp } from '@clerk/nextjs';
import { useState, ChangeEvent, FormEvent } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState as useReactState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';

interface FormState {
  email: string;
  password: string;
  confirmPassword: string;
}

interface FieldErrors {
  [key: string]: string;
}

export default function CustomSignUpView() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useReactState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useReactState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setGeneralError('');
  };

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setGeneralError('');
    // Confirm password check
    if (form.password !== form.confirmPassword) {
      setFieldErrors({
        confirmPassword:
          'The passwords you entered do not match. Please try again.'
      });
      setLoading(false);
      return;
    }
    if (!signUp) {
      setGeneralError('Sign up is not available. Please try again later.');
      setLoading(false);
      return;
    }
    // 2. Clerk sign up
    try {
      await signUp.create({
        username: form.email.split('@')[0].replace(/[^a-zA-Z]/g, ''),
        emailAddress: form.email,
        password: form.password
      });
      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      // 3. Register in backend with status=pending
      await axiosInstance.post('/admins', {
        email: form.email
      });
      setPendingVerification(true);
    } catch (err: unknown) {
      // Clerk error handling
      if (
        typeof err === 'object' &&
        err !== null &&
        'errors' in err &&
        Array.isArray((err as any).errors)
      ) {
        const newFieldErrors: FieldErrors = {};
        (err as any).errors.forEach((error: any) => {
          if (error.meta && error.meta.paramName) {
            newFieldErrors[error.meta.paramName] = error.message;
          } else {
            setGeneralError(error.message);
          }
        });
        setFieldErrors(newFieldErrors);
      } else {
        setGeneralError('Sign up failed. Please try again.');
      }
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  const handleVerify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setGeneralError('');
    if (!signUp) {
      setGeneralError('Sign up is not available. Please try again later.');
      setLoading(false);
      return;
    }
    try {
      await signUp.attemptEmailAddressVerification({ code });
      if (!signUp.createdSessionId) {
        setGeneralError('Session ID not found after verification.');
        setLoading(false);
        return;
      }
      await setActive({ session: signUp.createdSessionId });
      router.push('/dashboard/overview');
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'errors' in err &&
        Array.isArray((err as any).errors)
      ) {
        setGeneralError(
          (err as any).errors.map((e: any) => e.message).join(' ')
        );
      } else {
        setGeneralError('Verification failed. Please try again.');
      }
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  if (!isLoaded) return null;

  return (
    <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
      {!pendingVerification ? (
        <form onSubmit={handleSignUp} className='w-full space-y-4'>
          <div className='space-y-2'>
            <label htmlFor='email' className='block text-sm font-medium'>
              Email
            </label>
            <input
              id='email'
              name='email'
              type='email'
              autoComplete='email'
              value={form.email}
              onChange={handleChange}
              className={cn(
                'block w-full rounded-md border border-white/50 px-3 py-2',
                fieldErrors.email && 'border-red-500'
              )}
              required
            />
            {fieldErrors.email && (
              <p className='text-xs text-red-500'>{fieldErrors.email}</p>
            )}
          </div>
          <div className='space-y-2'>
            <label htmlFor='password' className='block text-sm font-medium'>
              Password
            </label>
            <div className='relative'>
              <input
                id='password'
                name='password'
                type={showPassword ? 'text' : 'password'}
                autoComplete='new-password'
                value={form.password}
                onChange={handleChange}
                className={cn(
                  'block w-full rounded-md border border-white/50 px-3 py-2 pr-10',
                  fieldErrors.password && 'border-red-500'
                )}
                required
              />
              <button
                type='button'
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                className='absolute top-1/2 right-2 -translate-y-1/2 text-xs text-gray-500 focus:outline-none'
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {fieldErrors.password && (
              <p className='text-xs text-red-500'>{fieldErrors.password}</p>
            )}
          </div>
          <div className='space-y-2'>
            <label
              htmlFor='confirmPassword'
              className='block text-sm font-medium'
            >
              Confirm Password
            </label>
            <div className='relative'>
              <input
                id='confirmPassword'
                name='confirmPassword'
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete='new-password'
                value={form.confirmPassword}
                onChange={handleChange}
                className={cn(
                  'block w-full rounded-md border border-white/50 px-3 py-2 pr-10',
                  fieldErrors.confirmPassword && 'border-red-500'
                )}
                required
              />
              <button
                type='button'
                tabIndex={-1}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className='absolute top-1/2 right-2 -translate-y-1/2 text-xs text-gray-500 focus:outline-none'
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className='text-xs text-red-500'>
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>
          {generalError && (
            <div className='text-sm text-red-500'>{generalError}</div>
          )}
          <div
            id='clerk-captcha'
            data-cl-theme='auto'
            data-cl-size='normal'
            data-cl-language='auto'
          />
          <button
            type='submit'
            className={cn(
              buttonVariants(),
              'bg-primary hover:bg-primary/90 w-full'
            )}
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className='w-full space-y-4'>
          <div className='space-y-2'>
            <label htmlFor='code' className='block text-sm font-medium'>
              Verification Code
            </label>
            <input
              id='code'
              name='code'
              type='text'
              value={code}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setCode(e.target.value)
              }
              className={cn(
                'block w-full rounded-md border border-white/50 px-3 py-2 pr-10',
                fieldErrors.confirmPassword && 'border-red-500'
              )}
              required
            />
          </div>
          {generalError && (
            <div className='text-sm text-red-500'>{generalError}</div>
          )}
          <button
            type='submit'
            className={cn(buttonVariants(), 'w-full')}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
      )}
    </div>
  );
}
