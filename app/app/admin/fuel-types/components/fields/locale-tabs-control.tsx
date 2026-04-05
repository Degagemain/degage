'use client';

import { ContentLocale } from '@/i18n/locales';
import { cn } from '@/app/lib/utils';

interface LocaleTabsControlProps {
  locales: readonly ContentLocale[];
  activeLocale: ContentLocale;
  onLocaleChange: (locale: ContentLocale) => void;
  errorLocales?: readonly ContentLocale[];
  disabled?: boolean;
}

export function LocaleTabsControl({ locales, activeLocale, onLocaleChange, errorLocales = [], disabled }: LocaleTabsControlProps) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-md border p-0.5">
      {locales.map((locale) => {
        const hasError = errorLocales.includes(locale);
        return (
          <button
            key={locale}
            type="button"
            onClick={() => onLocaleChange(locale)}
            disabled={disabled}
            className={cn(
              'rounded-sm px-1.5 py-0.5 text-[11px] leading-5 font-medium uppercase transition-colors',
              activeLocale === locale ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              hasError && activeLocale !== locale ? 'text-destructive ring-destructive/40 ring-1' : null,
              hasError && activeLocale === locale ? 'ring-destructive/50 ring-1' : null,
              'disabled:pointer-events-none disabled:opacity-50',
            )}
            aria-pressed={activeLocale === locale}
          >
            <span className="inline-flex items-center gap-1">
              {locale}
              {hasError ? <span className="bg-destructive size-1.5 rounded-full" aria-hidden /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
