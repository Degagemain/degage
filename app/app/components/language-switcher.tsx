'use client';

import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Globe } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/app/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { localeDisplayNames, uiLocales } from '@/i18n/locales';

export function LanguageSwitcher({ triggerClassName, showLabel = false }: { triggerClassName?: string; showLabel?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('language');

  const switchLocale = async (newLocale: string) => {
    const response = await fetch('/api/user/locale', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: newLocale }),
    });
    if (!response.ok) {
      toast.error(t('updateFailed'));
      return;
    }
    toast.success(localeDisplayNames[newLocale as keyof typeof localeDisplayNames]);
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={showLabel ? 'sm' : 'icon'} title={t('label')} className={cn(triggerClassName, showLabel && 'gap-2')}>
          <Globe className="h-5 w-5 shrink-0" />
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
