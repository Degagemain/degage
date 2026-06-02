'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { PublicShell } from '@/app/components/public/public-shell';
import { authClient } from '@/app/lib/auth';
import { buildSignInUrlWithReturnPath } from '@/app/lib/sign-in-return-path';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.replace(buildSignInUrlWithReturnPath(pathname ?? '/app/account/settings'));
    }
  }, [isPending, session, router, pathname]);

  if (isPending || !session) {
    return (
      <PublicShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="bg-muted size-8 animate-pulse rounded-full" />
        </div>
      </PublicShell>
    );
  }

  return <PublicShell>{children}</PublicShell>;
}
