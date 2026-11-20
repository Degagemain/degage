'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { CAR_SHARING_PATH, carSharingAccess } from '@/app/car-sharing/access';
import { PublicShell } from '@/app/components/public/public-shell';
import { authClient } from '@/app/lib/auth';
import { buildSignInUrlWithReturnPath } from '@/app/lib/sign-in-return-path';

export default function CarSharingLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const signedIn = Boolean(session);
  const access = carSharingAccess(signedIn, 'enabled');

  useEffect(() => {
    if (!mounted || isPending) return;
    if (access === 'sign-in') {
      router.replace(buildSignInUrlWithReturnPath(pathname ?? CAR_SHARING_PATH));
    }
  }, [mounted, isPending, access, router, pathname]);

  if (!mounted || isPending || access === 'sign-in') {
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
