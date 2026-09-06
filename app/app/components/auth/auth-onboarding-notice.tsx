'use client';

import { useTranslations } from 'next-intl';

const DEGAPP_URL = 'https://degapp.be/';

export function AuthOnboardingNotice() {
  const t = useTranslations('auth');

  return (
    <div className="w-full rounded-xl border border-[#DECA80] bg-[#FDF3E0] px-4 py-3 text-sm text-stone-800" role="note">
      <p className="font-semibold">{t('onboardingNoticeTitle')}</p>
      <p className="mt-1 leading-relaxed">
        {t.rich('onboardingNoticeBody', {
          degapp: (chunks) => (
            <a
              href={DEGAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--public-brand)] underline underline-offset-2 hover:text-[var(--public-brand-hover)]"
            >
              {chunks}
            </a>
          ),
        })}
      </p>
    </div>
  );
}
