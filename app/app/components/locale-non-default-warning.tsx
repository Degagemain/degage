'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Globe, TriangleAlertIcon } from 'lucide-react';

import { DEFAULT_LOCALE } from '@/domain/locale.model';
import { type UILocale, localeDisplayNames } from '@/i18n/locales';
import { trackNonDefaultLocaleWarningViewed } from '@/app/lib/posthog-events';
import { cn } from '@/app/lib/utils';

import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';

type LanguageSwitcherIconProps = {
  className?: string;
};

export function LanguageSwitcherIcon({ className }: LanguageSwitcherIconProps) {
  const locale = useLocale();
  const t = useTranslations('language');

  if (locale === DEFAULT_LOCALE) {
    return <Globe className={cn('h-5 w-5 shrink-0', className)} />;
  }

  const currentLanguage = localeDisplayNames[locale as UILocale];
  const notice = t('nonDefaultLocaleNotice', { language: currentLanguage });

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <span
          className={cn('inline-flex shrink-0 text-amber-600 hover:text-amber-700 dark:text-amber-500', className)}
          aria-label={notice}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            trackNonDefaultLocaleWarningViewed(locale);
          }}
        >
          <TriangleAlertIcon className="h-5 w-5" aria-hidden />
        </span>
      </HoverCardTrigger>
      <HoverCardContent side="bottom" align="end" className="w-72 text-sm">
        {notice}
      </HoverCardContent>
    </HoverCard>
  );
}
