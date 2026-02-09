import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { type UILocale, defaultUILocale, uiLocales } from './locales';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('locale')?.value;

  let locale: UILocale = defaultUILocale;

  if (cookieLocale && uiLocales.includes(cookieLocale as UILocale)) {
    locale = cookieLocale as UILocale;
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});
