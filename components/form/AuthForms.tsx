'use client';

import { useActionState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/form/Button';
import { FieldError, FormError } from '@/components/form/FieldError';
import { loginUser, registerUser, type LoginState, type RegisterField, type RegisterState } from '@/utils/authActions';
import { MAX_EMAIL_LENGTH, MAX_NAME_LENGTH, MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '@/lib/authRules';

// next is where to go after logging in; the server re-checks it's a same-site path
type AuthFormProps = { next: string };

const withNext = (path: string, next: string) => (next === '/' ? path : `${path}?next=${encodeURIComponent(next)}`);

export function LoginForm({ next, email }: AuthFormProps & { email?: string }) {
  const [state, formAction] = useActionState(loginUser, {} as LoginState);
  const passwordRef = useRef<HTMLInputElement>(null);

  // A failed attempt usually means a mistyped password, so focus goes back there
  useEffect(() => {
    if (state.error) passwordRef.current?.focus();
  }, [state]);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <FormError message={state.error} />

      <div>
        <Label className="mb-2" htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          name="email"
          autoComplete="email"
          // Filled in after registering; autoFocus otherwise so the form is ready to type into
          defaultValue={state.values?.email ?? email}
          autoFocus={!email}
          maxLength={MAX_EMAIL_LENGTH}
          required
          className="h-11"
        />
      </div>
      <div>
        <Label className="mb-2" htmlFor="password">Password</Label>
        <Input
          ref={passwordRef}
          id="password"
          type="password"
          name="password"
          autoComplete="current-password"
          autoFocus={Boolean(email)}
          maxLength={MAX_PASSWORD_LENGTH}
          required
          className="h-11"
          {...(state.error && { 'aria-invalid': true })}
        />
      </div>

      <SubmitButton text="Log in" variant="brand" className="h-11 w-full" />
      <p className="text-center text-sm text-muted-foreground">
        New here?{' '}
        <Link href={withNext('/register', next)} className="font-medium text-foreground underline underline-offset-4 hover:text-brand">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: AuthFormProps) {
  const [state, formAction] = useActionState(registerUser, {} as RegisterState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.field) {
      const field = formRef.current?.elements.namedItem(state.field);
      if (field instanceof HTMLElement) field.focus();
    }
  }, [state]);

  const fieldError = (field: RegisterField) => (state.field === field ? state.error : undefined);
  const invalidProps = (field: RegisterField) =>
    fieldError(field) ? { 'aria-invalid': true, 'aria-describedby': `${field}-error` } : {};

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <FormError message={state.field ? undefined : state.error} />
      <p className="sr-only" aria-live="assertive">{state.field ? state.error : ''}</p>

      <div>
        <Label className="mb-2" htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          defaultValue={state.values?.name}
          autoFocus
          maxLength={MAX_NAME_LENGTH}
          required
          className="h-11"
          {...invalidProps('name')}
        />
        <FieldError id="name-error" message={fieldError('name')} />
      </div>
      <div>
        <Label className="mb-2" htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          name="email"
          autoComplete="email"
          defaultValue={state.values?.email}
          maxLength={MAX_EMAIL_LENGTH}
          required
          className="h-11"
          {...invalidProps('email')}
        />
        <FieldError id="email-error" message={fieldError('email')} />
      </div>
      <div>
        <Label className="mb-2" htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          maxLength={MAX_PASSWORD_LENGTH}
          required
          className="h-11"
          aria-describedby={fieldError('password') ? 'password-error' : 'password-hint'}
          {...(fieldError('password') && { 'aria-invalid': true })}
        />
        {fieldError('password') ? (
          <FieldError id="password-error" message={fieldError('password')} />
        ) : (
          <p id="password-hint" className="mt-1.5 text-xs text-muted-foreground">At least {MIN_PASSWORD_LENGTH} characters.</p>
        )}
      </div>

      <SubmitButton text="Create account" variant="brand" className="h-11 w-full" />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href={withNext('/login', next)} className="font-medium text-foreground underline underline-offset-4 hover:text-brand">
          Log in
        </Link>
      </p>
    </form>
  );
}
