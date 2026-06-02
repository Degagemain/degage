'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { authPath, authViewPaths } from '@/app/components/auth/auth-view-paths';
import { isEmailOtpEnabled, isMagicLinkEnabled } from '@/app/components/auth/lib/auth-features';

type AuthAlternateMethodsProps = {
  search: string;
};

export function AuthAlternateMethods({ search }: AuthAlternateMethodsProps) {
  const t = useTranslations('auth');
  const showMagic = isMagicLinkEnabled();
  const showOtp = isEmailOtpEnabled();

  if (!showMagic && !showOtp) return null;

  return (
    <div className="flex flex-col gap-2 text-center text-sm">
      {showMagic ? (
        <Link href={authPath(authViewPaths.MAGIC_LINK, search)} className="text-[var(--public-brand)] hover:underline">
          {t('magicLink')}
        </Link>
      ) : null}
      {showOtp ? (
        <Link href={authPath(authViewPaths.EMAIL_OTP, search)} className="text-[var(--public-brand)] hover:underline">
          {t('emailOtpLink')}
        </Link>
      ) : null}
    </div>
  );
}
