'use client';

import { useEffect, useRef } from 'react';

import { authClient } from '@/app/lib/auth';
import { identifyPostHogUser, resetPostHog } from '@/app/lib/posthog';

export function PosthogIdentify() {
  const { data: session, isPending } = authClient.useSession();
  const hadIdentifiedSessionRef = useRef(false);

  useEffect(() => {
    if (isPending) return;

    const user = session?.user;
    if (user) {
      identifyPostHogUser(user.id, user.email, user.role ?? 'user', user.name);
      hadIdentifiedSessionRef.current = true;
      return;
    }

    if (hadIdentifiedSessionRef.current) {
      resetPostHog();
      hadIdentifiedSessionRef.current = false;
    }
  }, [isPending, session?.user]);

  return null;
}
