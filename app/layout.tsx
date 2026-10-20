import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import '@/app/globals.css';

import { PreviewEnvironmentBanner } from '@/app/components/preview-environment-banner';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          <PreviewEnvironmentBanner />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
