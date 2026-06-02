'use client';

import { useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';

import { authClient } from '@/app/lib/auth';
import { identifyPostHogUser, resetPostHog } from '@/app/lib/posthog';

export function PostHogIdentify() {
  const locale = useLocale();
  const { data: session, isPending } = authClient.useSession();
  const hadIdentifiedSessionRef = useRef(false);

  const user = session?.user;
  const userId = user?.id;
  const userEmail = user?.email;
  const userRole = user?.role;
  const userName = user?.name;

  useEffect(() => {
    if (isPending) return;

    if (userId && userEmail) {
      identifyPostHogUser(userId, userEmail, userRole ?? 'user', userName ?? null, { locale });
      hadIdentifiedSessionRef.current = true;
      return;
    }

    if (hadIdentifiedSessionRef.current) {
      resetPostHog();
      hadIdentifiedSessionRef.current = false;
    }
  }, [isPending, userId, userEmail, userRole, userName, locale]);

  return null;
}
