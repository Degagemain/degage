'use client';

import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

import { useAuthRedirectTo } from '@/app/components/auth/hooks/use-auth-redirect-to';
import { usePostAuthRedirect } from '@/app/components/auth/hooks/use-post-auth-redirect';

export function AuthCallback() {
  const { redirectTo } = useAuthRedirectTo();
  const { completeSignIn } = usePostAuthRedirect(redirectTo);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void completeSignIn({ flow: 'sign_in', method: 'google' });
  }, [completeSignIn]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="size-8 animate-spin text-[var(--public-brand)]" aria-label="Loading" />
    </div>
  );
}
