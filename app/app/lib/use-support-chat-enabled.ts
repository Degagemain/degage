'use client';

import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import { isPostHogClientEnabled } from '@/app/lib/posthog';
import { supportChatFeatureFlag } from '@/domain/chat.model';

export type SupportChatAvailability = 'loading' | 'enabled' | 'disabled';

export function useSupportChatAvailability(): SupportChatAvailability {
  const [availability, setAvailability] = useState<SupportChatAvailability>('loading');

  useEffect(() => {
    if (!isPostHogClientEnabled()) {
      setAvailability('enabled');
      return;
    }

    const apply = () => {
      setAvailability(posthog.isFeatureEnabled(supportChatFeatureFlag) === true ? 'enabled' : 'disabled');
    };

    if (posthog.isFeatureEnabled(supportChatFeatureFlag) !== undefined) {
      apply();
    }

    return posthog.onFeatureFlags(apply);
  }, []);

  return availability;
}
