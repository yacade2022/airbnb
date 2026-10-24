import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import AddHomeForm from '@/components/form/AddHomeForm';
import { canManageHome, requireUser } from '@/lib/auth';
import { fetchHomeById } from '@/utils/actions';

export const metadata: Metadata = { title: 'Edit listing' };

type EditHomePageProps = {
  params: Promise<{ id: string }>;
};

async function EditHomePage({ params }: EditHomePageProps) {
  const { id } = await params;
  const user = await requireUser(`/homes/${id}/edit`);
  const home = await fetchHomeById(id);
  // Same response for "doesn't exist" and "not yours", so other people's listings aren't revealed
  if (!home || !canManageHome(user, home)) notFound();

  return (
    <section className="py-6 pb-16 sm:py-8">
      <Link
        href={`/homes/${home.id}`}
        className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm font-medium hover:bg-accent"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to listing
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight break-words sm:text-3xl">Edit {home.location}</h1>
      {home.ownerId !== user.id && (
        <p className="mt-2 text-sm text-muted-foreground">
          You&apos;re editing as admin{home.owner ? <> on behalf of {home.owner.name}</> : null}.
        </p>
      )}
      <div className="mt-8 max-w-3xl rounded-2xl border p-5 shadow-sm sm:p-8">
        <AddHomeForm home={home} />
      </div>
    </section>
  );
}

export default EditHomePage;
