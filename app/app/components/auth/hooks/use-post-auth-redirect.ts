'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useTransition } from 'react';

import { authClient } from '@/app/lib/auth';

export function usePostAuthRedirect(redirectTo: string) {
  const router = useRouter();
  const { refetch } = authClient.useSession();
  const [isPending, startTransition] = useTransition();

  const completeSignIn = useCallback(async () => {
    await refetch();
    startTransition(() => {
      router.push(redirectTo);
      router.refresh();
    });
  }, [redirectTo, router, refetch]);

  return { completeSignIn, isPending };
}
