'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useTransition } from 'react';

import { authClient } from '@/app/lib/auth';
import { setPostHogPersonProperties } from '@/app/lib/posthog';
import { type AuthMethod, trackAuthSignInCompleted, trackAuthSignUpCompleted } from '@/app/lib/posthog-events';

type PostAuthOptions = {
  flow: 'sign_in' | 'sign_up';
  method: AuthMethod;
};

export function usePostAuthRedirect(redirectTo: string) {
  const router = useRouter();
  const { refetch } = authClient.useSession();
  const [isPending, startTransition] = useTransition();

  const completeSignIn = useCallback(
    async (options?: PostAuthOptions) => {
      await refetch();
      if (options) {
        if (options.flow === 'sign_in') {
          trackAuthSignInCompleted(options.method);
        } else {
          trackAuthSignUpCompleted(options.method);
        }
        setPostHogPersonProperties({ auth_method: options.method });
      }
      startTransition(() => {
        router.push(redirectTo);
        router.refresh();
      });
    },
    [redirectTo, router, refetch],
  );

  return { completeSignIn, isPending };
}
