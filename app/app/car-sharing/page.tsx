'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { CAR_SHARING_HOME_PATH, carSharingAccess } from '@/app/car-sharing/access';
import { PublicPage } from '@/app/components/public/public-shell';
import { authClient } from '@/app/lib/auth';
import { useCarSharingEnabled } from '@/app/lib/use-car-sharing-enabled';

export default function CarSharingPage() {
  const t = useTranslations('carSharingPage');
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const flag = useCarSharingEnabled();
  const access = carSharingAccess(!isPending && Boolean(session), flag);

  useEffect(() => {
    if (access === 'home') {
      router.replace(CAR_SHARING_HOME_PATH);
    }
  }, [access, router]);

  if (access !== 'page') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-[var(--public-brand)] border-t-transparent" />
      </div>
    );
  }

  return (
    <PublicPage narrow>
      <h1 className="text-[28px] leading-tight font-extrabold tracking-tight text-stone-900">{t('title')}</h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-stone-600">{t('intro')}</p>
    </PublicPage>
  );
}
