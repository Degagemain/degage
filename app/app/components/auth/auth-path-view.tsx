'use client';

import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { PublicPage } from '@/app/components/public/public-shell';
import { authViewPaths, isAuthViewPath } from '@/app/components/auth/auth-view-paths';
import { AuthCallback } from '@/app/components/auth/forms/auth-callback';
import { EmailOtpStub } from '@/app/components/auth/forms/email-otp-stub';
import { ForgotPasswordForm } from '@/app/components/auth/forms/forgot-password-form';
import { MagicLinkStub } from '@/app/components/auth/forms/magic-link-stub';
import { ResetPasswordForm } from '@/app/components/auth/forms/reset-password-form';
import { SignInForm } from '@/app/components/auth/forms/sign-in-form';
import { SignUpForm } from '@/app/components/auth/forms/sign-up-form';
import { OAuthConsentForm } from '@/app/components/auth/forms/oauth-consent-form';
import { useAuthRedirectTo } from '@/app/components/auth/hooks/use-auth-redirect-to';

type AuthPathViewProps = {
  path: string;
};

function AuthPathContent({ path }: AuthPathViewProps) {
  const { redirectTo, search } = useAuthRedirectTo();

  if (!isAuthViewPath(path)) {
    notFound();
  }

  switch (path) {
    case authViewPaths.SIGN_IN:
      return <SignInForm redirectTo={redirectTo} search={search} />;
    case authViewPaths.SIGN_UP:
      return <SignUpForm redirectTo={redirectTo} search={search} />;
    case authViewPaths.FORGOT_PASSWORD:
      return <ForgotPasswordForm search={search} />;
    case authViewPaths.RESET_PASSWORD:
      return <ResetPasswordForm />;
    case authViewPaths.CALLBACK:
      return <AuthCallback />;
    case authViewPaths.MAGIC_LINK:
      return <MagicLinkStub />;
    case authViewPaths.EMAIL_OTP:
      return <EmailOtpStub />;
    case authViewPaths.CONSENT:
      return <OAuthConsentForm />;
    default:
      notFound();
  }
}

export function AuthPathView({ path }: AuthPathViewProps) {
  return (
    <PublicPage narrow className="flex flex-col items-center justify-center py-12">
      <Suspense fallback={<div className="h-64 w-full max-w-sm animate-pulse rounded-xl bg-stone-200" />}>
        <AuthPathContent path={path} />
      </Suspense>
    </PublicPage>
  );
}
