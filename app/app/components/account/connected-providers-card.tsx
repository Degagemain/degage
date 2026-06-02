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
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>{t('signInMethods')}</CardTitle>
        <CardDescription>{t('signInMethodsDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {accounts === null ? (
          <div className="bg-muted h-12 animate-pulse rounded-lg" />
        ) : (
          <>
            {githubEnabled ? (
              <ProviderRow
                name="GitHub"
                description={t('signInWithGithubDescription')}
                linked={accounts.some((a) => a.providerId === 'github')}
                loading={loadingId === 'github'}
                onLink={() => handleLink('github')}
                onUnlink={() => {
                  const acc = accounts.find((a) => a.providerId === 'github');
                  if (acc) void handleUnlink(acc);
                }}
                connectLabel={t('connectAccount')}
                disconnectLabel={t('disconnectAccount')}
                connectedLabel={t('accountConnected')}
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
  description,
  linked,
  loading,
  onLink,
  onUnlink,
  connectLabel,
  disconnectLabel,
  connectedLabel,
}: {
  name: string;
  description: string;
  linked: boolean;
  loading: boolean;
  onLink: () => void;
  onUnlink: () => void;
  connectLabel: string;
  disconnectLabel: string;
  connectedLabel: string;
}) {
  return (
    <div className="border-border flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
      <div className="min-w-0 space-y-0.5">
        <p className="font-medium">{name}</p>
        <p className="text-muted-foreground text-sm">{linked ? connectedLabel : description}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={linked ? onUnlink : onLink}
        className="shrink-0 rounded-full"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : linked ? disconnectLabel : connectLabel}
      </Button>
    </div>
  );
}
