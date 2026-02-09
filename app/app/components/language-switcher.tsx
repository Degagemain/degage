'use client';

import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Globe } from 'lucide-react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { localeDisplayNames, uiLocales } from '@/i18n/locales';

export function LanguageSwitcher() {
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
        <Button variant="ghost" size="icon" title={t('label')}>
          <Globe className="h-5 w-5" />
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
