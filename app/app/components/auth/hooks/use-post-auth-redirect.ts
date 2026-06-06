'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useTransition } from 'react';

import { continueOAuthFlow, hasOAuthQueryInUrl, redirectToOAuthUrl } from '@/app/components/auth/lib/oauth-flow';
import { authClient } from '@/app/lib/auth';

export function usePostAuthRedirect(redirectTo: string) {
  const router = useRouter();
  const { refetch } = authClient.useSession();
  const [isPending, startTransition] = useTransition();

  const completeSignIn = useCallback(async () => {
    await refetch();

    if (hasOAuthQueryInUrl()) {
      const result = await continueOAuthFlow({ created: true });
      if (result.redirect && result.url) {
        redirectToOAuthUrl(result.url);
        return;
      }
    }

    startTransition(() => {
      router.push(redirectTo);
      router.refresh();
    });
  }, [redirectTo, router, refetch]);

  return { completeSignIn, isPending };
}
