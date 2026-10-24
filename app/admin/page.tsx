import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { SubmitButton } from '@/components/form/Button';
import ConfirmForm from '@/components/form/ConfirmForm';
import ListingActions from '@/components/home/ListingActions';
import { isAdmin, requireUser } from '@/lib/auth';
import { formatListedDate, formatPrice } from '@/lib/format';
import { deleteUser, fetchAdminHomes, fetchAdminUsers } from '@/utils/actions';

export const metadata: Metadata = { title: 'Admin' };

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

async function AdminPage() {
  const user = await requireUser('/admin');
  // A 404 rather than "forbidden", so regular users can't tell the page exists
  if (!isAdmin(user)) notFound();
  const [homes, users] = await Promise.all([fetchAdminHomes(), fetchAdminUsers()]);

  return (
    <div className="py-8 pb-16">
      <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
        <ShieldCheck className="size-7 text-brand" aria-hidden />
        Admin
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {plural(homes.length, 'listing')} · {plural(users.length, 'account')}
      </p>
      {/* Jump links; both sections are long on phones */}
      <nav aria-label="Admin sections" className="mt-4 flex gap-2">
        <a href="#listings" className="inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium hover:bg-accent">Listings</a>
        <a href="#users" className="inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium hover:bg-accent">Users</a>
      </nav>

      <section id="listings" aria-labelledby="listings-heading" className="mt-10 scroll-mt-32">
        <h2 id="listings-heading" className="text-xl font-semibold">All listings</h2>
        {homes.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No homes are listed yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {homes.map((home) => (
              <li key={home.id} className="flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center">
                <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-32">
                  <Image src={home.photo} alt="" fill sizes="(min-width: 640px) 128px, 100vw" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold break-words">
                    <Link href={`/homes/${home.id}`} className="hover:underline">{home.location}</Link>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {home.title} · {formatPrice(home.price)} night · Listed {formatListedDate(home.createdAt)}
                  </p>
                  <p className="mt-1 text-sm break-words">
                    {home.owner ? (
                      <>Owner: {home.owner.name} <span className="text-muted-foreground">({home.owner.email})</span></>
                    ) : (
                      <span className="text-muted-foreground">No owner</span>
                    )}
                  </p>
                </div>
                <ListingActions home={home} returnTo="/admin#listings" />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="users" aria-labelledby="users-heading" className="mt-12 scroll-mt-32">
        <h2 id="users-heading" className="text-xl font-semibold">Users</h2>
        <ul className="mt-4 divide-y rounded-2xl border">
          {users.map((account) => (
            <li key={account.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-medium break-words">
                  {account.name}
                  {account.role === 'ADMIN' && (
                    <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">Admin</span>
                  )}
                  {account.id === user.id && <span className="text-xs font-normal text-muted-foreground">(you)</span>}
                </p>
                <p className="text-sm text-muted-foreground break-all">{account.email}</p>
                <p className="text-sm text-muted-foreground">
                  {plural(account._count.homes, 'listing')} · Joined {formatListedDate(account.createdAt)}
                </p>
              </div>
              {/* Admin accounts can't be deleted here (deleteUser refuses too), so the admin can't be locked out */}
              {account.role !== 'ADMIN' && (
                <ConfirmForm
                  action={deleteUser.bind(null, account.id)}
                  message={`Delete ${account.name}'s account and ${plural(account._count.homes, 'listing')}? This can’t be undone.`}
                >
                  <SubmitButton
                    text="Delete user"
                    size="default"
                    variant="outline"
                    className="h-11 w-full border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive sm:w-auto"
                  />
                </ConfirmForm>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default AdminPage;
