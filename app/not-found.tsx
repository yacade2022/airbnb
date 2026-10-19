import Link from 'next/link';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/global/EmptyState';

function NotFound() {
  return (
    <EmptyState as="h1" title="We couldn't find that page" description="The home may have been removed, or the link may be incorrect.">
      <Button asChild variant="brand" className="h-11 px-5">
        <Link href="/">Browse homes</Link>
      </Button>
    </EmptyState>
  );
}

export default NotFound;
