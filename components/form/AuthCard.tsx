// Narrow centred card shared by the login and register pages
function AuthCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-md py-10 pb-16 sm:py-16">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>
      <div className="mt-6 space-y-5 rounded-2xl border p-5 shadow-sm sm:p-8">{children}</div>
    </section>
  );
}

export default AuthCard;
