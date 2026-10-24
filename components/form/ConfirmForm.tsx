'use client';

type ConfirmFormProps = {
  action: () => Promise<void>;
  message: string;
  className?: string;
  children: React.ReactNode;
};

// Asks before running a destructive action. Without JavaScript the form still submits, unconfirmed
function ConfirmForm({ action, message, className, children }: ConfirmFormProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      className={className}
    >
      {children}
    </form>
  );
}

export default ConfirmForm;
