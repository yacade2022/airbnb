import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/form/Button';
import ConfirmForm from '@/components/form/ConfirmForm';
import { deleteHome } from '@/utils/actions';
import { cn } from '@/lib/utils';

type ListingActionsProps = {
  home: { id: string; location: string };
  // Where to go after deleting; the listing's own page no longer exists by then
  returnTo: string;
  className?: string;
};

// Only render for someone who can manage the home; deleteHome and updateHome check again on the server
function ListingActions({ home, returnTo, className }: ListingActionsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <Button asChild variant="outline" className="h-11 flex-1 px-4 sm:flex-none">
        <Link href={`/homes/${home.id}/edit`}>
          <Pencil aria-hidden />
          Edit<span className="sr-only"> {home.location}</span>
        </Link>
      </Button>
      <ConfirmForm
        action={deleteHome.bind(null, home.id, returnTo)}
        message={`Delete the listing in ${home.location}? Its reservations and favorites are removed too. This can’t be undone.`}
        className="flex-1 sm:flex-none"
      >
        <SubmitButton
          text="Delete"
          size="default"
          variant="outline"
          className="h-11 w-full border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive"
        />
      </ConfirmForm>
    </div>
  );
}

export default ListingActions;
