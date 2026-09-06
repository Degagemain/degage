'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { PublicShell } from '@/app/components/public/public-shell';
import { authClient } from '@/app/lib/auth';
import { buildSignInUrlWithReturnPath } from '@/app/lib/sign-in-return-path';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isPending) return;
    if (!session) {
      router.replace(buildSignInUrlWithReturnPath(pathname ?? '/app/dashboard'));
    }
  }, [mounted, isPending, session, router, pathname]);

  if (!mounted || isPending || !session) {
    return (
      <PublicShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-[var(--public-brand)] border-t-transparent" />
        </div>
      </PublicShell>
    );
  }

  return <PublicShell>{children}</PublicShell>;
}
