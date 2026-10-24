import { CircleAlert } from 'lucide-react';

// Shown under an input; id is referenced by the input's aria-describedby
export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1.5 text-sm text-destructive">
      <CircleAlert className="size-4 shrink-0" aria-hidden />
      {message}
    </p>
  );
}

// Errors not tied to one field (e.g. a failed upload), shown above the form
export function FormError({ message, children }: { message?: string; children?: React.ReactNode }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
      <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
      <p>
        {message} {children}
      </p>
    </div>
  );
}
