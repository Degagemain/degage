'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, TriangleAlertIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { apiDelete, apiPut } from '@/app/lib/api-client';
import { authClient } from '@/app/lib/auth';
import type { PlayConnectorStatus } from '@/domain/play-connector.model';

export function PlayConnectorCard() {
  const t = useTranslations('playConnector');
  const { data: session } = authClient.useSession();
  const [status, setStatus] = useState<PlayConnectorStatus | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<'load' | 'connect' | 'disconnect' | null>('load');

  const loadStatus = useCallback(async () => {
    setLoading((current) => current ?? 'load');
    try {
      const response = await fetch('/api/play-connector');
      if (!response.ok) {
        throw new Error('load failed');
      }
      const data = (await response.json()) as PlayConnectorStatus;
      setStatus(data);
      if (data.email) {
        setEmail(data.email);
      }
    } catch {
      toast.error(t('loadFailed'));
    } finally {
      setLoading(null);
    }
  }, [t]);

  useEffect(() => {
    if (session?.user?.email && !email) {
      setEmail(session.user.email);
    }
  }, [session?.user?.email, email]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const handleConnect = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading('connect');
    try {
      const response = await apiPut('/api/play-connector', { email, password });
      const data = (await response.json()) as PlayConnectorStatus & { code?: string };
      if (!response.ok) {
        throw new Error(data.code ?? 'connect failed');
      }
      setStatus(data);
      setPassword('');
      toast.success(t('connectSuccess'));
    } catch {
      toast.error(t('connectFailed'));
    } finally {
      setLoading(null);
    }
  };

  const handleDisconnect = async () => {
    setLoading('disconnect');
    try {
      const response = await apiDelete('/api/play-connector');
      const data = (await response.json()) as PlayConnectorStatus;
      if (!response.ok) {
        throw new Error('disconnect failed');
      }
      setStatus(data);
      setPassword('');
      if (session?.user?.email) {
        setEmail(session.user.email);
      }
      toast.success(t('disconnectSuccess'));
    } catch {
      toast.error(t('disconnectFailed'));
    } finally {
      setLoading(null);
    }
  };

  if (loading === 'load' && status === null) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted h-24 animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const showForm = status?.status === 'missing' || status?.status === 'failing';

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="rounded-lg border border-amber-300/80 bg-amber-50 px-4 py-3 text-sm text-stone-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
          role="note"
        >
          <div className="flex gap-3">
            <TriangleAlertIcon className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
            <div>
              <p className="font-medium dark:text-amber-50">{t('credentialsNoticeTitle')}</p>
              <p className="text-muted-foreground mt-1 leading-relaxed dark:text-amber-100/90">{t('credentialsNoticeBody')}</p>
            </div>
          </div>
        </div>

        {status?.status === 'success' ? (
          <div className="space-y-3">
            <p className="text-sm">{t('connectedAs', { email: status.email ?? '' })}</p>
            {status.sessionExpiresAt ? (
              <p className="text-muted-foreground text-sm">
                {t('sessionValidUntil', {
                  date: new Date(status.sessionExpiresAt).toLocaleString(),
                })}
              </p>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading === 'disconnect'}
              onClick={() => void handleDisconnect()}
              className="rounded-full"
            >
              {loading === 'disconnect' ? <Loader2 className="size-4 animate-spin" /> : t('disconnect')}
            </Button>
          </div>
        ) : null}

        {status?.status === 'failing' ? (
          <div className="space-y-3">
            <div className="border-destructive/30 bg-destructive/5 rounded-lg border px-4 py-3">
              <p className="font-medium">{t('failingTitle')}</p>
              <p className="text-muted-foreground mt-1 text-sm">{t('failingDescription')}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading === 'disconnect'}
              onClick={() => void handleDisconnect()}
              className="rounded-full"
            >
              {loading === 'disconnect' ? <Loader2 className="size-4 animate-spin" /> : t('disconnect')}
            </Button>
          </div>
        ) : null}

        {showForm ? (
          <form onSubmit={(event) => void handleConnect(event)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="play-connector-email">{t('email')}</Label>
              <Input
                id="play-connector-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t('emailPlaceholder')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="play-connector-password">{t('password')}</Label>
              <Input
                id="play-connector-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <Button type="submit" size="sm" disabled={loading === 'connect'} className="rounded-full">
              {loading === 'connect' ? <Loader2 className="size-4 animate-spin" /> : t('connect')}
            </Button>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
