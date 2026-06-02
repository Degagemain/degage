'use client';

import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { apiPatch } from '@/app/lib/api-client';
import { trackLocaleChanged } from '@/app/lib/posthog-events';
import { cn } from '@/app/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { localeDisplayNames, uiLocales } from '@/i18n/locales';

import { LanguageSwitcherIcon } from './locale-non-default-warning';

export function LanguageSwitcher({ triggerClassName, showLabel = false }: { triggerClassName?: string; showLabel?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('language');

  const switchLocale = async (newLocale: string) => {
    if (newLocale === locale) return;
    const response = await apiPatch('/api/user/locale', { locale: newLocale });
    if (!response.ok) {
      toast.error(t('updateFailed'));
      return;
    }
    trackLocaleChanged(locale, newLocale, 'header');
    toast.success(localeDisplayNames[newLocale as keyof typeof localeDisplayNames]);
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={showLabel ? 'sm' : 'icon'} title={t('label')} className={cn(triggerClassName, showLabel && 'gap-2')}>
          <LanguageSwitcherIcon />
          {showLabel && <span className="max-w-[8rem] truncate">{localeDisplayNames[locale as keyof typeof localeDisplayNames]}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {uiLocales.map((code) => (
          <DropdownMenuItem key={code} onClick={() => switchLocale(code)} className={locale === code ? 'bg-accent' : ''}>
            {localeDisplayNames[code]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
