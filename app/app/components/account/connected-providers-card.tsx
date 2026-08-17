'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { InlineCopy } from '@/app/components/inline-copy';
import { getAuthErrorMessage } from '@/app/components/auth/lib/auth-errors';
import { getSocialProviders } from '@/app/components/auth/lib/auth-features';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { authClient } from '@/app/lib/auth';

type LinkedAccount = {
  id: string;
  providerId: string;
  accountId: string;
};

type SocialProviderId = 'github' | 'google';

const SOCIAL_PROVIDER_LABELS: Record<
  SocialProviderId,
  { name: string; descriptionKey: 'signInWithGithubDescription' | 'signInWithGoogleDescription' }
> = {
  github: { name: 'GitHub', descriptionKey: 'signInWithGithubDescription' },
  google: { name: 'Google', descriptionKey: 'signInWithGoogleDescription' },
};

function isSocialProviderId(provider: string): provider is SocialProviderId {
  return provider in SOCIAL_PROVIDER_LABELS;
}

export function ConnectedProvidersCard() {
  const t = useTranslations('auth');
  const providers = getSocialProviders().filter(isSocialProviderId);
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

  const handleLink = async (provider: SocialProviderId) => {
    setLoadingId(provider);
    try {
      const callbackURL = `${window.location.origin}/app/auth/callback?redirectTo=${encodeURIComponent('/app/account/settings')}`;
      await authClient.linkSocial({
        provider,
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
        <CardDescription>
          <InlineCopy>{t('signInMethodsDescription')}</InlineCopy>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {accounts === null ? (
          <div className="bg-muted h-12 animate-pulse rounded-lg" />
        ) : (
          providers.map((providerId) => {
            const config = SOCIAL_PROVIDER_LABELS[providerId];
            const linkedAccount = accounts.find((a) => a.providerId === providerId);

            return (
              <ProviderRow
                key={providerId}
                name={config.name}
                description={t(config.descriptionKey)}
                linked={!!linkedAccount}
                loading={loadingId === providerId}
                onLink={() => handleLink(providerId)}
                onUnlink={() => {
                  if (linkedAccount) void handleUnlink(linkedAccount);
                }}
                connectLabel={t('connectAccount')}
                disconnectLabel={t('disconnectAccount')}
                connectedLabel={t('accountConnected')}
              />
            );
          })
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
        <p className="text-muted-foreground text-sm">
          <InlineCopy>{linked ? connectedLabel : description}</InlineCopy>
        </p>
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
