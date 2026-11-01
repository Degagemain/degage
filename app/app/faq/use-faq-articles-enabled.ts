'use client';

import { useEffect, useState } from 'react';
import { FAQ_ARTICLES_FEATURE_FLAG, type FeatureFlag } from '@/domain/feature-flag.model';
import { Page } from '@/domain/page.model';
import { MaxTake } from '@/domain/utils';

export type FaqArticlesAvailability = 'loading' | 'enabled' | 'disabled';

export function useFaqArticlesEnabled(): FaqArticlesAvailability {
  const [availability, setAvailability] = useState<FaqArticlesAvailability>('loading');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const params = new URLSearchParams({ take: String(MaxTake) });
        const response = await fetch(`/api/feature-flags?${params.toString()}`);
        if (!response.ok) {
          if (!cancelled) setAvailability('disabled');
          return;
        }
        const result: Page<FeatureFlag> = await response.json();
        const flag = result.records.find((item) => item.code === FAQ_ARTICLES_FEATURE_FLAG);
        if (!cancelled) {
          setAvailability(flag?.enabled === true ? 'enabled' : 'disabled');
        }
      } catch {
        if (!cancelled) setAvailability('disabled');
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return availability;
}
