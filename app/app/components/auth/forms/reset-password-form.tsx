'use client';

import { useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import * as z from 'zod';

import { AuthCard } from '@/app/components/auth/auth-card';
import { AuthFooterLinks } from '@/app/components/auth/auth-footer-links';
import { AuthPasswordInput } from '@/app/components/auth/auth-password-input';
import { AuthPrimaryButton } from '@/app/components/auth/auth-primary-button';
import { authPath, authViewPaths } from '@/app/components/auth/auth-view-paths';
import { useAuthRedirectTo } from '@/app/components/auth/hooks/use-auth-redirect-to';
import { getAuthErrorMessage } from '@/app/components/auth/lib/auth-errors';
import { Label } from '@/app/components/ui/label';
import { authClient } from '@/app/lib/auth';

export function ResetPasswordForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { search } = useAuthRedirectTo();
  const tokenChecked = useRef(false);

  const schema = z
    .object({
      newPassword: z.string().min(8, t('changePasswordInstructions')),
      confirmPassword: z.string().min(1, t('confirmPasswordRequired')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('passwordsDoNotMatch'),
      path: ['confirmPassword'],
    });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const loading = form.formState.isSubmitting;

  useEffect(() => {
    if (tokenChecked.current) return;
    tokenChecked.current = true;
    const token = searchParams.get('token');
    if (!token || token === 'INVALID_TOKEN') {
      toast.error(t('invalidToken'));
      router.replace(authPath(authViewPaths.SIGN_IN, search));
    }
  }, [router, search, searchParams, t]);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    const token = searchParams.get('token');
    if (!token) return;

    try {
      await authClient.resetPassword({
        newPassword: values.newPassword,
        token,
        fetchOptions: { throw: true },
      });
      toast.success(t('resetPasswordSuccess'));
      router.push(authPath(authViewPaths.SIGN_IN, search));
    } catch (error) {
      form.reset();
      toast.error(getAuthErrorMessage(error, t));
    }
  };

  return (
    <AuthCard title={t('resetPassword')} description={t('resetPasswordDescription')}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword">{t('newPassword')}</Label>
          <AuthPasswordInput
            id="newPassword"
            autoComplete="new-password"
            placeholder={t('newPasswordPlaceholder')}
            disabled={loading}
            {...form.register('newPassword')}
          />
          {form.formState.errors.newPassword ? <p className="text-sm text-red-600">{form.formState.errors.newPassword.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
          <AuthPasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder={t('confirmPasswordPlaceholder')}
            disabled={loading}
            {...form.register('confirmPassword')}
          />
          {form.formState.errors.confirmPassword ? (
            <p className="text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
          ) : null}
        </div>

        <AuthPrimaryButton loading={loading}>{t('resetPasswordAction')}</AuthPrimaryButton>
        <AuthFooterLinks variant="forgot-password" search={search} />
      </form>
    </AuthCard>
  );
}
