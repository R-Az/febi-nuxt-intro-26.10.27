export function PageTitle({ children, actions }: { children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-xl font-bold text-slate-800">{children}</h1>
      {actions}
    </div>
  );
}
