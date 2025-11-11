'use client';
import { useSignIn } from '@clerk/nextjs';
import { useState, ChangeEvent, FormEvent } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface FormState {
  email: string;
  password: string;
}

interface FieldErrors {
  [key: string]: string;
}

// Helper function to get user-friendly error messages
const getErrorMessage = (error: any): string => {
  switch (error.code) {
    case 'form_identifier_not_found':
      return 'No account found with this email address. Please check your email or sign up.';
    case 'form_password_incorrect':
      return 'Incorrect password. Please try again.';
    case 'form_identifier_invalid':
      return 'Please enter a valid email address.';
    case 'form_password_pwned':
      return 'This password has been compromised. Please choose a different password.';
    case 'form_password_too_short':
      return 'Password is too short. Please use a longer password.';
    case 'form_password_too_long':
      return 'Password is too long. Please use a shorter password.';
    case 'form_identifier_already_exists':
      return 'An account with this email already exists.';
    case 'form_identifier_not_allowed':
      return 'This email address is not allowed. Please use a different email.';
    default:
      return error.message || 'An error occurred. Please try again.';
  }
};

export default function CustomSignInForm() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [form, setForm] = useState<FormState>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState('');
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setGeneralError('');
  };

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setGeneralError('');
    if (!signIn) {
      setGeneralError('Sign in is not available. Please try again later.');
      setLoading(false);
      return;
    }
    try {
      const result = await signIn.create({
        identifier: form.email,
        password: form.password
      });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        // Fetch user info from backend
        router.push('/dashboard/overview');
        // Optionally redirect or show success
      } else if (result.status === 'needs_first_factor') {
        setGeneralError('Additional authentication required.');
      } else {
        setGeneralError('Sign in failed.');
      }
    } catch (err: unknown) {
      console.error('Sign in error:', err);

      if (
        typeof err === 'object' &&
        err !== null &&
        'errors' in err &&
        Array.isArray((err as any).errors)
      ) {
        const newFieldErrors: FieldErrors = {};
        let hasFieldErrors = false;

        (err as any).errors.forEach((error: any) => {
          // Handle Clerk-specific error structure
          if (error.meta && error.meta.param_name) {
            // Map Clerk param_name to form field names
            const fieldName =
              error.meta.param_name === 'identifier'
                ? 'email'
                : error.meta.param_name;

            newFieldErrors[fieldName] = getErrorMessage(error);
            hasFieldErrors = true;
          } else if (error.meta && error.meta.paramName) {
            // Handle alternative param name structure
            const fieldName =
              error.meta.paramName === 'identifier'
                ? 'email'
                : error.meta.paramName;

            newFieldErrors[fieldName] = getErrorMessage(error);
            hasFieldErrors = true;
          } else {
            // Set as general error if no specific field
            setGeneralError(error.message);
          }
        });

        if (hasFieldErrors) {
          setFieldErrors(newFieldErrors);
        }
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        // Handle simple error objects
        setGeneralError((err as any).message);
      } else {
        setGeneralError('Sign in failed. Please try again.');
      }
      setLoading(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <form onSubmit={handleSignIn} className='w-full space-y-4'>
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
        <input
          id='password'
          name='password'
          type='password'
          autoComplete='current-password'
          value={form.password}
          onChange={handleChange}
          className={cn(
            'block w-full rounded-md border border-white/50 px-3 py-2',
            fieldErrors.password && 'border-red-500'
          )}
          required
        />
        {fieldErrors.password && (
          <p className='text-xs text-red-500'>{fieldErrors.password}</p>
        )}
      </div>
      {generalError && (
        <div className='text-sm text-red-500'>{generalError}</div>
      )}
      <button
        type='submit'
        className={cn(
          buttonVariants(),
          'bg-primary hover:bg-primary/90 w-full'
        )}
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
