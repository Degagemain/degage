'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import * as z from 'zod';

import { AuthAlternateMethods } from '@/app/components/auth/auth-alternate-methods';
import { AuthCard } from '@/app/components/auth/auth-card';
import { AuthOnboardingNotice } from '@/app/components/auth/auth-onboarding-notice';
import { AuthFooterLinks } from '@/app/components/auth/auth-footer-links';
import { AuthPasswordInput } from '@/app/components/auth/auth-password-input';
import { AuthPrimaryButton } from '@/app/components/auth/auth-primary-button';
import { SocialSignInButtons } from '@/app/components/auth/social-sign-in-buttons';
import { authPath, authViewPaths } from '@/app/components/auth/auth-view-paths';
import { usePostAuthRedirect } from '@/app/components/auth/hooks/use-post-auth-redirect';
import { getAuthErrorCode, getAuthErrorMessage } from '@/app/components/auth/lib/auth-errors';
import { trackAuthSignInFailed } from '@/app/lib/posthog-events';
import { isSocialAuthEnabled } from '@/app/components/auth/lib/auth-features';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { authClient } from '@/app/lib/auth';

type SignInFormProps = {
  redirectTo: string;
  search: string;
};

export function SignInForm({ redirectTo, search }: SignInFormProps) {
  const t = useTranslations('auth');
  const { completeSignIn, isPending } = usePostAuthRedirect(redirectTo);
  const showSocial = isSocialAuthEnabled();

  const schema = z.object({
    email: z.string().email(t('emailInvalid')),
    password: z.string().min(1, t('passwordRequired')),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const loading = form.formState.isSubmitting || isPending;

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      await authClient.signIn.email({
        email: values.email,
        password: values.password,
        fetchOptions: { throw: true },
      });
      await completeSignIn({ flow: 'sign_in', method: 'email' });
    } catch (error) {
      form.resetField('password');
      trackAuthSignInFailed('email', getAuthErrorCode(error));
      toast.error(getAuthErrorMessage(error, t));
    }
  };

  const callbackURL = typeof window !== 'undefined' ? `${window.location.origin}${redirectTo}` : redirectTo;

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <AuthOnboardingNotice />
      <AuthCard title={t('signIn')} description={t('signInDescription')}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t('emailPlaceholder')}
              disabled={loading}
              {...form.register('email')}
            />
            {form.formState.errors.email ? <p className="text-sm text-red-600">{form.formState.errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t('password')}</Label>
              <Link href={authPath(authViewPaths.FORGOT_PASSWORD, search)} className="text-sm text-[var(--public-brand)] hover:underline">
                {t('forgotPasswordLink')}
              </Link>
            </div>
            <AuthPasswordInput
              id="password"
              autoComplete="current-password"
              placeholder={t('passwordPlaceholder')}
              disabled={loading}
              {...form.register('password')}
            />
            {form.formState.errors.password ? <p className="text-sm text-red-600">{form.formState.errors.password.message}</p> : null}
          </div>

          <AuthPrimaryButton loading={loading}>{t('signInAction')}</AuthPrimaryButton>

          {showSocial ? (
            <>
              <div className="flex items-center gap-2">
                <span className="bg-border h-px flex-1" />
                <span className="text-muted-foreground text-sm">{t('orContinueWith')}</span>
                <span className="bg-border h-px flex-1" />
              </div>
              <SocialSignInButtons callbackURL={callbackURL} disabled={loading} />
            </>
          ) : null}

          <AuthAlternateMethods search={search} />
          <AuthFooterLinks variant="sign-in" search={search} />
        </form>
      </AuthCard>
    </div>
  );
}
