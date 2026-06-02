'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { AuthCard } from '@/app/components/auth/auth-card';
import { AuthFooterLinks } from '@/app/components/auth/auth-footer-links';
import { authPath, authViewPaths } from '@/app/components/auth/auth-view-paths';
import { useAuthRedirectTo } from '@/app/components/auth/hooks/use-auth-redirect-to';
import { isEmailOtpEnabled } from '@/app/components/auth/lib/auth-features';

export function EmailOtpStub() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { search } = useAuthRedirectTo();
  const enabled = isEmailOtpEnabled();

  useEffect(() => {
    if (!enabled) {
      router.replace(authPath(authViewPaths.SIGN_IN, search));
    }
  }, [enabled, router, search]);

  if (!enabled) return null;

  return (
    <AuthCard title={t('emailOtp')} description={t('featureNotConfigured')}>
      <AuthFooterLinks variant="forgot-password" search={search} />
    </AuthCard>
  );
}
