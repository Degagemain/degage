'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  CAR_SHARING_HOME_PATH,
  type CarSharingConnection,
  carSharingAccess,
  carSharingConnectHref,
  carSharingConnectionFromStatus,
  carSharingShowsConnectPrompt,
} from '@/app/car-sharing/access';
import { PublicPage } from '@/app/components/public/public-shell';
import { Button } from '@/app/components/ui/button';
import { authClient } from '@/app/lib/auth';
import { useCarSharingEnabled } from '@/app/lib/use-car-sharing-enabled';

export function CarSharingContent({ status }: { status: CarSharingConnection }) {
  const t = useTranslations('carSharingPage');

  return (
    <PublicPage narrow>
      <h1 className="text-[28px] leading-tight font-extrabold tracking-tight text-stone-900">{t('title')}</h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-stone-600">{t('intro')}</p>
      {status === 'load-error' ? <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-stone-600">{t('loadError')}</p> : null}
      {status !== 'load-error' && carSharingShowsConnectPrompt(status) ? (
        <Button className="mt-8 h-11 rounded-lg bg-[var(--public-brand)] px-6 text-white hover:bg-[var(--public-brand-hover)]" asChild>
          <Link href={carSharingConnectHref}>{t('connect')}</Link>
        </Button>
      ) : null}
    </PublicPage>
  );
}

export default function CarSharingPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const flag = useCarSharingEnabled();
  const access = carSharingAccess(!isPending && Boolean(session), flag);
  const [connection, setConnection] = useState<CarSharingConnection | null>(null);

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
        if (!cancelled) setConnection(carSharingConnectionFromStatus(data.status));
      } catch {
        if (!cancelled) setConnection('load-error');
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
