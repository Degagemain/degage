'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { authPath, authViewPaths } from '@/app/components/auth/auth-view-paths';

type AuthFooterLinksProps = {
  variant: 'sign-in' | 'sign-up' | 'forgot-password';
  search: string;
};

export function AuthFooterLinks({ variant, search }: AuthFooterLinksProps) {
  const t = useTranslations('auth');

  if (variant === 'sign-in') {
    return (
      <p className="text-center text-sm text-stone-600">
        {t('dontHaveAnAccount')}{' '}
        <Link href={authPath(authViewPaths.SIGN_UP, search)} className="font-medium text-[var(--public-brand)] hover:underline">
          {t('signUp')}
        </Link>
      </p>
    );
  }

  if (variant === 'sign-up') {
    return (
      <p className="text-center text-sm text-stone-600">
        {t('alreadyHaveAnAccount')}{' '}
        <Link href={authPath(authViewPaths.SIGN_IN, search)} className="font-medium text-[var(--public-brand)] hover:underline">
          {t('signIn')}
        </Link>
      </p>
    );
  }

  return (
    <p className="text-center text-sm text-stone-600">
      <Link href={authPath(authViewPaths.SIGN_IN, search)} className="font-medium text-[var(--public-brand)] hover:underline">
        {t('goBack')}
      </Link>
    </p>
  );
}
