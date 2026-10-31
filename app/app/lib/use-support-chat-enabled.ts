'use client';

import { useEffect, useState } from 'react';
import { type FeatureFlag, SUPPORT_CHAT_FEATURE_FLAG } from '@/domain/feature-flag.model';
import { Page } from '@/domain/page.model';
import { MaxTake } from '@/domain/utils';

export type SupportChatAvailability = 'loading' | 'enabled' | 'disabled';

export function useSupportChatAvailability(): SupportChatAvailability {
  const [availability, setAvailability] = useState<SupportChatAvailability>('loading');

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
        const flag = result.records.find((item) => item.code === SUPPORT_CHAT_FEATURE_FLAG);
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
