import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CircleCheck } from 'lucide-react';
import AuthCard from '@/components/form/AuthCard';
import { LoginForm } from '@/components/form/AuthForms';
import { getCurrentUser } from '@/lib/auth';
import { safeNextPath } from '@/lib/authRules';

export const metadata: Metadata = { title: 'Log in' };

type LoginPageProps = {
  searchParams: Promise<{ next?: string; registered?: string; email?: string }>;
};

async function LoginPage({ searchParams }: LoginPageProps) {
  const { next: nextParam, registered, email } = await searchParams;
  const next = safeNextPath(nextParam);
  // Already logged in: carry on to where they were going
  if (await getCurrentUser()) redirect(next);

  return (
    <AuthCard
      title="Log in"
      description={next === '/addHomeToList' ? 'Log in to list your home. You’ll go straight to the form.' : 'Welcome back.'}
    >
      {registered === '1' && (
        <div role="status" className="flex items-start gap-3 rounded-xl border border-success/30 bg-success-soft p-4 text-sm text-success">
          <CircleCheck className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p><span className="font-semibold">Your account is ready.</span> Log in to continue.</p>
        </div>
      )}
      <LoginForm next={next} email={registered === '1' ? email : undefined} />
    </AuthCard>
  );
}

export default LoginPage;
