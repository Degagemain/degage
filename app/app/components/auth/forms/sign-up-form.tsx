'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import * as z from 'zod';

import { AuthCard } from '@/app/components/auth/auth-card';
import { AuthOnboardingNotice } from '@/app/components/auth/auth-onboarding-notice';
import { AuthFooterLinks } from '@/app/components/auth/auth-footer-links';
import { AuthPasswordInput } from '@/app/components/auth/auth-password-input';
import { AuthPrimaryButton } from '@/app/components/auth/auth-primary-button';
import { GithubSignInButton } from '@/app/components/auth/github-sign-in-button';
import { authPath, authViewPaths } from '@/app/components/auth/auth-view-paths';
import { usePostAuthRedirect } from '@/app/components/auth/hooks/use-post-auth-redirect';
import { getAuthErrorMessage } from '@/app/components/auth/lib/auth-errors';
import { isGithubAuthEnabled } from '@/app/components/auth/lib/auth-features';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { authClient } from '@/app/lib/auth';

type SignUpFormProps = {
  redirectTo: string;
  search: string;
};

export function SignUpForm({ redirectTo, search }: SignUpFormProps) {
  const t = useTranslations('auth');
  const router = useRouter();
  const { completeSignIn, isPending } = usePostAuthRedirect(redirectTo);
  const showGithub = isGithubAuthEnabled();

  const schema = z.object({
    name: z.string().min(1, t('nameRequired')),
    email: z.string().email(t('emailInvalid')),
    password: z.string().min(8, t('changePasswordInstructions')),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const loading = form.formState.isSubmitting || isPending;

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const data = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
        callbackURL: `${origin}${redirectTo}`,
        fetchOptions: { throw: true },
      });

      if (data && typeof data === 'object' && 'token' in data && data.token) {
        await completeSignIn();
        return;
      }

      toast.success(t('signUpEmail'));
      router.push(authPath(authViewPaths.SIGN_IN, search));
    } catch (error) {
      form.resetField('password');
      toast.error(getAuthErrorMessage(error, t));
    }
  };

  const callbackURL = typeof window !== 'undefined' ? `${window.location.origin}${redirectTo}` : redirectTo;

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <AuthOnboardingNotice />
      <AuthCard title={t('signUp')} description={t('signUpDescription')}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('name')}</Label>
            <Input id="name" autoComplete="name" placeholder={t('namePlaceholder')} disabled={loading} {...form.register('name')} />
            {form.formState.errors.name ? <p className="text-sm text-red-600">{form.formState.errors.name.message}</p> : null}
          </div>

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
            <Label htmlFor="password">{t('password')}</Label>
            <AuthPasswordInput
              id="password"
              autoComplete="new-password"
              placeholder={t('passwordPlaceholder')}
              disabled={loading}
              {...form.register('password')}
            />
            <p className="text-muted-foreground text-xs">{t('changePasswordInstructions')}</p>
            {form.formState.errors.password ? <p className="text-sm text-red-600">{form.formState.errors.password.message}</p> : null}
          </div>

          <AuthPrimaryButton loading={loading}>{t('signUpAction')}</AuthPrimaryButton>

          {showGithub ? (
            <>
              <div className="flex items-center gap-2">
                <span className="bg-border h-px flex-1" />
                <span className="text-muted-foreground text-sm">{t('orContinueWith')}</span>
                <span className="bg-border h-px flex-1" />
              </div>
              <GithubSignInButton callbackURL={callbackURL} disabled={loading} />
            </>
          ) : null}

          <AuthFooterLinks variant="sign-up" search={search} />
        </form>
      </AuthCard>
    </div>
  );
}
