'use client';

import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { type UILocale, localeDisplayNames, uiLocales } from '@/i18n/locales';

export function UpdateLocaleCard() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('settings');

  const handleLocaleChange = async (newLocale: string) => {
    const response = await fetch('/api/user/locale', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: newLocale }),
    });
    if (!response.ok) {
      toast.error(t('languageUpdateFailed'));
      return;
    }
    toast.success(localeDisplayNames[newLocale as UILocale]);
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('language')}</CardTitle>
        <CardDescription>{t('languageDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={locale} onValueChange={handleLocaleChange}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {uiLocales.map((code) => (
              <SelectItem key={code} value={code}>
                {localeDisplayNames[code]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
