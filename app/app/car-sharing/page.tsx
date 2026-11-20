'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { CAR_SHARING_HOME_PATH, carSharingAccess, carSharingConnectHref, carSharingShowsConnectPrompt } from '@/app/car-sharing/access';
import { PublicPage } from '@/app/components/public/public-shell';
import { Button } from '@/app/components/ui/button';
import { authClient } from '@/app/lib/auth';
import { useCarSharingEnabled } from '@/app/lib/use-car-sharing-enabled';
import type { PlayConnectorStatusValue } from '@/domain/play-connector.model';

export function CarSharingContent({ status }: { status: PlayConnectorStatusValue }) {
  const t = useTranslations('carSharingPage');

  return (
    <PublicPage narrow>
      <h1 className="text-[28px] leading-tight font-extrabold tracking-tight text-stone-900">{t('title')}</h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-stone-600">{t('intro')}</p>
      {carSharingShowsConnectPrompt(status) ? (
        <Button className="mt-8 h-11 rounded-lg bg-[var(--public-brand)] px-6 text-white hover:bg-[var(--public-brand-hover)]" asChild>
          <Link href={carSharingConnectHref}>{t('connect')}</Link>
        </Button>
      ) : null}
    </PublicPage>
  );
}

const isPlayConnectorStatus = (value: string): value is PlayConnectorStatusValue =>
  value === 'missing' || value === 'failing' || value === 'success';

export default function CarSharingPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const flag = useCarSharingEnabled();
  const access = carSharingAccess(!isPending && Boolean(session), flag);
  const [connection, setConnection] = useState<PlayConnectorStatusValue | null>(null);

  useEffect(() => {
    if (access === 'home') {
      router.replace(CAR_SHARING_HOME_PATH);
    }
  }, [access, router]);

  useEffect(() => {
    if (access !== 'page') return;
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch('/api/play-connector');
        if (!response.ok) throw new Error('load failed');
        const data = (await response.json()) as { status?: string };
        if (!cancelled && data.status && isPlayConnectorStatus(data.status)) {
          setConnection(data.status);
        }
      } catch {
        if (!cancelled) setConnection('missing');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [access]);

  if (access !== 'page' || connection === null) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-[var(--public-brand)] border-t-transparent" />
      </div>
    );
  }

  return <CarSharingContent status={connection} />;
}
