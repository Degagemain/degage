'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { CarOnboarding } from '@/domain/car-onboarding.model';
import { apiPost } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';

const OVERVIEW_PATH = '/app/admin/car-onboardings';

export default function NewCarOnboardingPage() {
  const tCommon = useTranslations('admin.common');
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const create = async () => {
      try {
        const response = await apiPost('/api/car-onboardings', {});

        if (!response.ok) {
          const message = await parseApiErrorMessage(response, tCommon('feedback.saveError'));
          toast.error(message);
          router.replace(OVERVIEW_PATH);
          return;
        }

        const created: CarOnboarding = await response.json();
        if (created.id) {
          router.replace(`/app/admin/car-onboardings/${created.id}`);
          return;
        }

        toast.error(tCommon('feedback.saveError'));
        router.replace(OVERVIEW_PATH);
      } catch {
        toast.error(tCommon('feedback.saveError'));
        router.replace(OVERVIEW_PATH);
      }
    };

    void create();
  }, [router, tCommon]);

  return (
    <div className="flex min-h-[50vh] flex-1 items-center justify-center">
      <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
    </div>
  );
}
