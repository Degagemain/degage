'use client';

import { useEffect, useRef, useState } from 'react';
import { XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const PREVIEW_BANNER_DISMISS_KEY = 'preview-banner-dismissed-at';

const DISMISS_FOR_MS = 24 * 60 * 60 * 1000;

const isPreviewBannerDismissed = (): boolean => {
  try {
    const raw = window.localStorage.getItem(PREVIEW_BANNER_DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    if (!Number.isFinite(dismissedAt)) return false;
    return Date.now() - dismissedAt < DISMISS_FOR_MS;
  } catch {
    return false;
  }
};

const rememberPreviewBannerDismissal = () => {
  try {
    window.localStorage.setItem(PREVIEW_BANNER_DISMISS_KEY, String(Date.now()));
  } catch {
    // Private mode can block storage; the banner still stays hidden for this page view.
  }
};

export function PreviewEnvironmentBanner() {
  const t = useTranslations('previewEnvironment');
  const bannerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_VERCEL_ENV !== 'preview') return;
    if (isPreviewBannerDismissed()) return;
    setVisible(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const banner = bannerRef.current;
    if (!visible || !banner) {
      root.style.removeProperty('--preview-banner-offset');
      return;
    }

    const applyOffset = () => {
      root.style.setProperty('--preview-banner-offset', `${banner.offsetHeight}px`);
    };

    applyOffset();
    const observer = new ResizeObserver(applyOffset);
    observer.observe(banner);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--preview-banner-offset');
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div ref={bannerRef} role="status" className="fixed inset-x-0 top-0 z-40 bg-amber-400 text-amber-950">
      <div className="relative flex items-center justify-center px-10 py-2 text-center text-sm font-medium">
        <p>{t('message')}</p>
        <button
          type="button"
          onClick={() => {
            rememberPreviewBannerDismissal();
            setVisible(false);
          }}
          aria-label={t('dismiss')}
          className={
            'absolute right-2 inline-flex size-7 items-center justify-center rounded-md ' +
            'hover:bg-amber-500/50 focus-visible:ring-2 focus-visible:ring-amber-950/40 focus-visible:outline-none'
          }
        >
          <XIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
