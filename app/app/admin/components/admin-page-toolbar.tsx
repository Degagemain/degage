import { cn } from '@/app/lib/utils';

export function AdminPageToolbar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="border-b px-3 md:px-4">
      <div className={cn('flex min-h-14 flex-wrap items-center justify-start gap-2 py-3', className)}>{children}</div>
    </div>
  );
}
