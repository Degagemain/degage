import Link from 'next/link';
import { DM_Sans, Fraunces } from 'next/font/google';
import { getTranslations } from 'next-intl/server';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['800'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '600'],
});

export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <main
      className={`${dmSans.className} dark:bg-background dark:text-foreground flex min-h-screen items-center bg-[#F6F3EE] px-4 py-8 text-[#5A5248]`}
    >
      <div className="mx-auto w-full max-w-[700px]">
        <div className="dark:border-border dark:bg-card rounded-[12px] border border-[#DDD6CB] bg-white p-8 shadow-sm" role="status">
          <p className="dark:text-muted-foreground mb-2 text-center text-[12px] font-semibold tracking-[0.06em] text-[#5A5248] uppercase">
            {t('eyebrow')}
          </p>
          <h1 className={`${fraunces.className} dark:text-foreground mb-4 text-center text-[28px] leading-tight font-extrabold text-[#181510]`}>
            {t('title')}
          </h1>
          <p className="dark:text-muted-foreground mb-8 text-center text-[15px] leading-relaxed text-[#5A5248]">{t('description')}</p>
          <div className="flex justify-center">
            <Link
              href="/app"
              className="dark:focus-visible:ring-offset-background inline-flex items-center justify-center rounded-[8px] bg-[#1A3D2B] px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-[#285C40] focus-visible:ring-2 focus-visible:ring-[#1A3D2B] focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {t('homeCta')}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
