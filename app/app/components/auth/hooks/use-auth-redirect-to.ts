'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import { SIGN_IN_REDIRECT_QUERY_PARAM, sanitizePostSignInReturnPath } from '@/app/lib/sign-in-return-path';

export function useAuthRedirectTo() {
  const searchParams = useSearchParams();
  const redirectTo = useMemo(() => sanitizePostSignInReturnPath(searchParams.get(SIGN_IN_REDIRECT_QUERY_PARAM) ?? '/app'), [searchParams]);
  const search = useMemo(() => {
    const q = searchParams.toString();
    return q ? `?${q}` : '';
  }, [searchParams]);
  return { redirectTo, search };
}
