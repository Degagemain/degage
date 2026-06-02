'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { getAuthErrorMessage } from '@/app/components/auth/lib/auth-errors';
import { getSocialProviders, isGithubAuthEnabled } from '@/app/components/auth/lib/auth-features';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { authClient } from '@/app/lib/auth';

type LinkedAccount = {
  id: string;
  providerId: string;
  accountId: string;
};

export function ConnectedProvidersCard() {
  const t = useTranslations('auth');
  const providers = getSocialProviders();
  const [accounts, setAccounts] = useState<LinkedAccount[] | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    const result = await authClient.listAccounts({ fetchOptions: { throw: false } });
    setAccounts((result.data as LinkedAccount[] | null) ?? []);
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  if (!providers.length) return null;

  const githubEnabled = isGithubAuthEnabled();

  const handleLink = async (provider: string) => {
    setLoadingId(provider);
    try {
      const callbackURL = `${window.location.origin}/app/auth/callback?redirectTo=${encodeURIComponent('/app/account/settings')}`;
      await authClient.linkSocial({
        provider: provider as 'github',
        callbackURL,
        fetchOptions: { throw: true },
      });
    } catch (error) {
      toast.error(getAuthErrorMessage(error, t));
      setLoadingId(null);
    }
  };

  const handleUnlink = async (account: LinkedAccount) => {
    setLoadingId(account.providerId);
    try {
      await authClient.unlinkAccount({
        providerId: account.providerId,
        accountId: account.accountId,
        fetchOptions: { throw: true },
      });
      await loadAccounts();
    } catch (error) {
      toast.error(getAuthErrorMessage(error, t));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Card className="border-stone-200 bg-white">
      <CardHeader>
        <CardTitle>{t('providers')}</CardTitle>
        <CardDescription>{t('providersDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {accounts === null ? (
          <div className="h-12 animate-pulse rounded-lg bg-stone-100" />
        ) : (
          <>
            {githubEnabled ? (
              <ProviderRow
                name="GitHub"
                linked={accounts.some((a) => a.providerId === 'github')}
                loading={loadingId === 'github'}
                onLink={() => handleLink('github')}
                onUnlink={() => {
                  const acc = accounts.find((a) => a.providerId === 'github');
                  if (acc) void handleUnlink(acc);
                }}
                linkLabel={t('link')}
                unlinkLabel={t('unlink')}
              />
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ProviderRow({
  name,
  linked,
  loading,
  onLink,
  onUnlink,
  linkLabel,
  unlinkLabel,
}: {
  name: string;
  linked: boolean;
  loading: boolean;
  onLink: () => void;
  onUnlink: () => void;
  linkLabel: string;
  unlinkLabel: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-stone-200 px-4 py-3">
      <span className="font-medium text-stone-900">{name}</span>
      <Button type="button" variant="outline" size="sm" disabled={loading} onClick={linked ? onUnlink : onLink} className="rounded-full">
        {loading ? <Loader2 className="size-4 animate-spin" /> : linked ? unlinkLabel : linkLabel}
      </Button>
    </div>
  );
}
