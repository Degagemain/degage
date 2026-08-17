'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import * as z from 'zod';

import { InlineCopy } from '@/app/components/inline-copy';
import { AuthPrimaryButton } from '@/app/components/auth/auth-primary-button';
import { getAuthErrorMessage } from '@/app/components/auth/lib/auth-errors';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { authClient } from '@/app/lib/auth';

export function UpdateNameCard() {
  const t = useTranslations('auth');
  const { data: session, isPending } = authClient.useSession();

  const schema = z.object({
    name: z.string().min(1, t('nameRequired')),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    values: { name: session?.user.name ?? '' },
  });

  const loading = form.formState.isSubmitting || isPending;

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      await authClient.updateUser({
        name: values.name,
        fetchOptions: { throw: true },
      });
      toast.success(t('updatedSuccessfully'));
    } catch (error) {
      toast.error(getAuthErrorMessage(error, t));
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>{t('name')}</CardTitle>
        <CardDescription>
          <InlineCopy>{t('nameDescription')}</InlineCopy>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="account-name">{t('name')}</Label>
            <Input id="account-name" disabled={loading} {...form.register('name')} />
          </div>
          <AuthPrimaryButton loading={loading} className="w-full max-w-xs">
            {t('save')}
          </AuthPrimaryButton>
        </form>
      </CardContent>
    </Card>
  );
}
