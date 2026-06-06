'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

import { AuthCard } from '@/app/components/auth/auth-card';
import { AuthPrimaryButton } from '@/app/components/auth/auth-primary-button';
import { Button } from '@/app/components/ui/button';
import { filterConsentScopes, redirectToOAuthUrl, submitOAuthConsent } from '@/app/components/auth/lib/oauth-flow';
import { authClient } from '@/app/lib/auth';

export function OAuthConsentForm() {
  const t = useTranslations('auth.oauthConsent');
  const searchParams = useSearchParams();
  const { data: session } = authClient.useSession();
  const [loading, setLoading] = useState(false);

  const clientId = searchParams.get('client_id');
  const scopeParam = searchParams.get('scope');
  const scopes = filterConsentScopes(scopeParam, session?.user?.role).split(/\s+/).filter(Boolean);

  const onAccept = async () => {
    setLoading(true);
    try {
      const result = await submitOAuthConsent(true, scopes.join(' '));
      if (result.redirect && result.url) {
        redirectToOAuthUrl(result.url);
        return;
      }
      toast.error(t('error'));
    } catch {
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const onDeny = async () => {
    setLoading(true);
    try {
      const result = await submitOAuthConsent(false, scopes.join(' '));
      if (result.redirect && result.url) {
        redirectToOAuthUrl(result.url);
        return;
      }
      toast.error(t('error'));
    } catch {
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title={t('title')} description={t('description')}>
      <div className="space-y-4">
        {clientId ? (
          <p className="text-sm text-stone-600">
            {t('client')}: <span className="font-mono text-xs">{clientId}</span>
          </p>
        ) : null}
        <div>
          <p className="mb-2 text-sm font-medium text-stone-800">{t('scopesTitle')}</p>
          <ul className="list-inside list-disc space-y-1 text-sm text-stone-600">
            {scopes.map((scope) => (
              <li key={scope}>{scope.startsWith('mcp:') ? t('scopeMcp', { role: scope.replace('mcp:', '') }) : scope}</li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <AuthPrimaryButton type="button" onClick={onAccept} disabled={loading || scopes.length === 0}>
            {t('accept')}
          </AuthPrimaryButton>
          <Button type="button" variant="outline" className="h-10 w-full rounded-full" onClick={onDeny} disabled={loading}>
            {t('deny')}
          </Button>
        </div>
      </div>
    </AuthCard>
  );
}
