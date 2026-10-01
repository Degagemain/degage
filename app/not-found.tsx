import Link from 'next/link';
import { Archivo } from 'next/font/google';
import { getTranslations } from 'next-intl/server';

const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '700', '800'],
  display: 'swap',
});

export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <main className={`${archivo.className} flex min-h-screen items-center bg-white px-4 py-8 text-[#4a4a4a]`}>
      <div className="mx-auto w-full max-w-[700px]">
        <p className="mb-3 text-[12px] font-bold tracking-[0.1em] text-[#2f8a38] uppercase">{t('eyebrow')}</p>
        <h1 className="mb-4 text-[40px] leading-none font-extrabold tracking-[-0.04em] text-[#121212]">{t('title')}</h1>
        <p className="mb-8 max-w-xl text-[16px] leading-relaxed text-[#4a4a4a]">{t('description')}</p>
        <Link
          href="/app"
          className="inline-flex items-center justify-center rounded-full bg-[#2f8a38] px-6 py-3 text-[15px] font-bold text-white transition-colors hover:bg-[#267530] focus-visible:ring-2 focus-visible:ring-[#2f8a38] focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {t('homeCta')}
        </Link>
      </div>
    </main>
  );
}
