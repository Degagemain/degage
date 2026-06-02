'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import * as z from 'zod';

import { AuthCard } from '@/app/components/auth/auth-card';
import { AuthFooterLinks } from '@/app/components/auth/auth-footer-links';
import { AuthPrimaryButton } from '@/app/components/auth/auth-primary-button';
import { authPath, authViewPaths } from '@/app/components/auth/auth-view-paths';
import { getAuthErrorMessage } from '@/app/components/auth/lib/auth-errors';
import { trackAuthForgotPasswordSubmitted } from '@/app/lib/posthog-events';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { authClient } from '@/app/lib/auth';

type ForgotPasswordFormProps = {
  search: string;
};

export function ForgotPasswordForm({ search }: ForgotPasswordFormProps) {
  const t = useTranslations('auth');
  const router = useRouter();

  const schema = z.object({
    email: z.string().email(t('emailInvalid')),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const loading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      await authClient.requestPasswordReset({
        email: values.email,
        redirectTo: `${origin}/app/auth/reset-password`,
        fetchOptions: { throw: true },
      });
      toast.success(t('forgotPasswordEmail'));
      trackAuthForgotPasswordSubmitted();
      router.push(authPath(authViewPaths.SIGN_IN, search));
    } catch (error) {
      toast.error(getAuthErrorMessage(error, t));
    }
  };

  return (
    <AuthCard title={t('forgotPassword')} description={t('forgotPasswordDescription')}>
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

        <AuthPrimaryButton loading={loading}>{t('forgotPasswordAction')}</AuthPrimaryButton>
        <AuthFooterLinks variant="forgot-password" search={search} />
      </form>
    </AuthCard>
  );
}
