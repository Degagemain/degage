'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import * as z from 'zod';

import { InlineCopy } from '@/app/components/inline-copy';
import { AuthPasswordInput } from '@/app/components/auth/auth-password-input';
import { AuthPrimaryButton } from '@/app/components/auth/auth-primary-button';
import { getAuthErrorMessage } from '@/app/components/auth/lib/auth-errors';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { authClient } from '@/app/lib/auth';

export function ChangePasswordCard() {
  const t = useTranslations('auth');
  const [hasCredential, setHasCredential] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void authClient.listAccounts({ fetchOptions: { throw: false } }).then((result) => {
      if (cancelled) return;
      const accounts = result.data;
      setHasCredential(accounts?.some((a) => a.providerId === 'credential') ?? false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const schema = z
    .object({
      currentPassword: z.string().min(1, t('passwordRequired')),
      newPassword: z.string().min(8, t('changePasswordInstructions')),
      confirmPassword: z.string().min(1, t('confirmPasswordRequired')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('passwordsDoNotMatch'),
      path: ['confirmPassword'],
    });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const loading = form.formState.isSubmitting;

  if (hasCredential === null) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>{t('changePassword')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted h-24 animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!hasCredential) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>{t('changePassword')}</CardTitle>
          <CardDescription>
            <InlineCopy>{t('noPasswordSignIn')}</InlineCopy>
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: true,
        fetchOptions: { throw: true },
      });
      toast.success(t('changePasswordSuccess'));
      form.reset();
    } catch (error) {
      toast.error(getAuthErrorMessage(error, t));
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>{t('changePassword')}</CardTitle>
        <CardDescription>
          <InlineCopy>{t('changePasswordDescription')}</InlineCopy>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">{t('currentPassword')}</Label>
            <AuthPasswordInput id="current-password" autoComplete="current-password" disabled={loading} {...form.register('currentPassword')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password-account">{t('newPassword')}</Label>
            <AuthPasswordInput id="new-password-account" autoComplete="new-password" disabled={loading} {...form.register('newPassword')} />
            <p className="text-muted-foreground text-xs">
              <InlineCopy>{t('changePasswordInstructions')}</InlineCopy>
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password-account">{t('confirmPassword')}</Label>
            <AuthPasswordInput
              id="confirm-password-account"
              autoComplete="new-password"
              disabled={loading}
              {...form.register('confirmPassword')}
            />
            {form.formState.errors.confirmPassword ? (
              <p className="text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
            ) : null}
          </div>
          <AuthPrimaryButton loading={loading} className="w-full max-w-xs">
            {t('save')}
          </AuthPrimaryButton>
        </form>
      </CardContent>
    </Card>
  );
}
