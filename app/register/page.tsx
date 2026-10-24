import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AuthCard from '@/components/form/AuthCard';
import { RegisterForm } from '@/components/form/AuthForms';
import { getCurrentUser } from '@/lib/auth';
import { safeNextPath } from '@/lib/authRules';

export const metadata: Metadata = { title: 'Create an account' };

type RegisterPageProps = {
  searchParams: Promise<{ next?: string }>;
};

async function RegisterPage({ searchParams }: RegisterPageProps) {
  const next = safeNextPath((await searchParams).next);
  if (await getCurrentUser()) redirect(next);

  return (
    <AuthCard title="Create an account" description="You need an account to list a home. Browsing stays open to everyone.">
      <RegisterForm next={next} />
    </AuthCard>
  );
}

export default RegisterPage;
