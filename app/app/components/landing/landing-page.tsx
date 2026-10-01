'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Car, CarFront, Coins, Leaf, ParkingCircle, Scale, ShieldCheck, Sparkles, Users, Wallet, Wrench } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { InlineCopy } from '@/app/components/inline-copy';
import { LandingFaq } from '@/app/components/landing/landing-faq';
import { LandingHeader } from '@/app/components/landing/landing-header';
import { publicSans } from '@/app/components/public/public-fonts';
import { PublicFooter } from '@/app/components/public/public-footer';
import {
  landingBenefitsPad,
  landingContainer,
  landingEyebrowToTitle,
  landingGridGap,
  landingHeroPad,
  landingSectionBlockGap,
  landingSectionPad,
  landingTitleToBody,
} from '@/app/components/landing/landing-layout';
import styles from '@/app/components/public/public-theme.module.css';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/lib/utils';

const KNOCKOUT_KEYS = ['koopgidsKnockout1', 'koopgidsKnockout2', 'koopgidsKnockout3', 'koopgidsKnockout4'] as const;

const IDEAL_KEYS = ['koopgidsIdeal1', 'koopgidsIdeal2', 'koopgidsIdeal3'] as const;

const BENEFIT_ICONS = [Wallet, Car, Leaf, Users] as const;
const ADVANTAGE_ICONS = [Coins, ShieldCheck, Sparkles, Scale, Wrench, CarFront, ParkingCircle] as const;
const ABOUT_STATS = ['owners', 'members', 'years'] as const;
const VIDEOS = [
  { key: 'financial', id: 'ZoDTz8Eh1I4' },
  { key: 'personal', id: 'iSIWTBwmCu8' },
  { key: 'freedom', id: 'W-GVZmw7CGQ' },
] as const;

const brandButtonClassName = cn(styles.primaryCta, 'h-12 rounded-[4px] px-7 text-base');

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
};

function Reveal({ children, className, delayMs = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) {
          return;
        }

        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={cn(
        'transform-gpu transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:transform-none motion-reduce:opacity-100',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function LandingPage() {
  const t = useTranslations('landing');
  const tSim = useTranslations('simulationPublic.situatie');

  const benefits = ['cheaper', 'flexible', 'environment', 'community'] as const;
  const advantages = ['billing', 'insurance', 'platform', 'damage', 'breakdown', 'access', 'parking'] as const;

  return (
    <div className={cn(publicSans.variable, publicSans.className, styles.publicTheme, styles.pageSurface, 'flex min-h-screen flex-col')}>
      <LandingHeader />

      <div className="relative flex min-h-screen flex-1 flex-col overflow-x-hidden">
        <main className="flex-1">
          <section className={cn('relative', landingContainer, landingHeroPad)}>
            <div className={cn('grid items-center lg:grid-cols-[1.15fr_0.85fr]', landingGridGap)}>
              <div>
                <Reveal>
                  <p className={styles.kicker}>{t('hero.badge')}</p>
                  <h1 className={cn(landingEyebrowToTitle, styles.displayTitle)}>{t('hero.title')}</h1>
                </Reveal>
                <Reveal delayMs={90}>
                  <p className={cn(landingTitleToBody, 'max-w-xl text-lg leading-relaxed sm:text-xl', styles.textMuted)}>
                    <InlineCopy>{t('hero.subtitle')}</InlineCopy>
                  </p>
                </Reveal>
                <Reveal delayMs={160}>
                  <p className={cn('mt-4 max-w-xl text-base leading-relaxed', styles.textSubtle)}>
                    <InlineCopy>{t('hero.intro')}</InlineCopy>
                  </p>
                </Reveal>
                <Reveal delayMs={220}>
                  <div className={cn(landingSectionBlockGap, 'flex flex-col items-start gap-2')}>
                    <Button asChild size="lg" className={brandButtonClassName}>
                      <Link href="/app/simulation">
                        {t('hero.cta')}
                        <ArrowRight className="size-4" aria-hidden />
                      </Link>
                    </Button>
                    <p className={cn('text-sm', styles.textSubtle)}>
                      <InlineCopy>{t('hero.ctaHint')}</InlineCopy>
                    </p>
                  </div>
                </Reveal>
              </div>

              <Reveal delayMs={80}>
                <div className={cn('relative aspect-[4/3] w-full overflow-hidden shadow-md', styles.imageFrame, styles.leadImage)}>
                  <Image
                    src="/landing/hero.jpg"
                    alt={t('faq.imageAlt')}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 480px"
                    priority
                  />
                </div>
              </Reveal>
            </div>
          </section>

          <section className={cn(landingContainer, landingBenefitsPad)}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((key, index) => {
                const Icon = BENEFIT_ICONS[index];
                return (
                  <Reveal key={key} delayMs={index * 60}>
                    <article className={cn(styles.benefitCard, 'h-full bg-[var(--public-card-bg)] p-6')}>
                      <div className="mb-4 inline-flex bg-[var(--public-icon-bg)] p-2 text-[var(--public-accent)]">
                        <Icon className="size-5" aria-hidden />
                      </div>
                      <h2 className="text-lg font-extrabold tracking-tight">{t(`benefits.${key}.title`)}</h2>
                      <p className={cn('mt-2 text-sm leading-relaxed', styles.textMuted)}>
                        <InlineCopy>{t(`benefits.${key}.desc`)}</InlineCopy>
                      </p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </section>

          <section className={cn(styles.sectionElevated, landingSectionPad)}>
            <Reveal className={landingContainer}>
              <div className={cn('grid items-center lg:grid-cols-[1.15fr_0.85fr]', landingGridGap)}>
                <div>
                  <p className={styles.kicker}>{t('about.eyebrow')}</p>
                  <h2 className={cn(landingEyebrowToTitle, styles.sectionTitle)}>{t('about.title')}</h2>
                  <p className={cn(landingTitleToBody, 'text-lg leading-relaxed', styles.textBody)}>
                    <InlineCopy>{t('about.lead')}</InlineCopy>
                  </p>
                  <p className={cn('mt-4 text-base leading-relaxed', styles.textMuted)}>
                    <InlineCopy>{t('about.paragraph1')}</InlineCopy>
                  </p>
                  <p className={cn('mt-4 text-base leading-relaxed', styles.textMuted)}>
                    <InlineCopy>{t('about.paragraph2')}</InlineCopy>
                  </p>
                  <p className={cn('mt-4 text-base leading-relaxed', styles.textMuted)}>
                    <InlineCopy>{t('about.paragraph3')}</InlineCopy>
                  </p>

                  <dl className="mt-8 grid grid-cols-3 gap-px bg-[var(--public-border)]">
                    {ABOUT_STATS.map((key) => (
                      <div key={key} className="bg-[var(--public-surface)] px-4 py-5 text-center">
                        <dt className="text-2xl font-extrabold tracking-tight text-[var(--public-accent-deep)]">
                          {t(`about.stats.${key}.value`)}
                        </dt>
                        <dd className={cn('mt-1 text-xs font-bold tracking-wide uppercase', styles.textMuted)}>
                          {t(`about.stats.${key}.label`)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div
                  className={cn(
                    'relative mx-auto aspect-square w-full max-w-md overflow-hidden lg:max-w-none',
                    styles.imageFrame,
                    styles.leadImage,
                  )}
                >
                  <Image
                    src="/landing/community.jpg"
                    alt={t('about.imageAlt')}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 420px"
                    priority={false}
                  />
                </div>
              </div>
            </Reveal>
          </section>

          <section className={cn(styles.sectionMutedY, landingSectionPad)}>
            <Reveal className={landingContainer}>
              <div className="max-w-2xl">
                <p className={styles.kicker}>{t('eligibility.eyebrow')}</p>
                <h2 className={cn(landingEyebrowToTitle, styles.sectionTitle)}>{t('eligibility.title')}</h2>
                <p className={cn(landingTitleToBody, 'text-base leading-relaxed', styles.textMuted)}>
                  <InlineCopy>{t('eligibility.body')}</InlineCopy>
                </p>
              </div>

              <div className={cn(landingSectionBlockGap, 'grid gap-5 sm:gap-6 lg:grid-cols-2')}>
                <div className="border border-red-200 bg-red-50/50 p-6 sm:p-8">
                  <h3 className="text-lg font-extrabold tracking-tight text-red-900">{tSim('koopgidsKnockoutTitle')}</h3>
                  <ul className="mt-5 space-y-3">
                    {KNOCKOUT_KEYS.map((key) => (
                      <li key={key} className={cn('flex gap-3 text-sm leading-relaxed sm:text-base', styles.textBody)}>
                        <span
                          className="mt-0.5 flex size-5 shrink-0 items-center justify-center bg-red-100 text-xs font-bold text-red-700"
                          aria-hidden
                        >
                          !
                        </span>
                        <InlineCopy>{tSim(key)}</InlineCopy>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border border-[var(--public-border)] bg-[var(--public-surface)] p-6 sm:p-8">
                  <h3 className="text-lg font-extrabold tracking-tight text-[var(--public-accent-deep)]">{tSim('koopgidsIdealTitle')}</h3>
                  <ul className="mt-5 space-y-3">
                    {IDEAL_KEYS.map((key) => (
                      <li key={key} className={cn('flex gap-3 text-sm leading-relaxed sm:text-base', styles.textBody)}>
                        <span
                          className="mt-0.5 flex size-5 shrink-0 items-center justify-center bg-[var(--public-surface-muted)] text-xs font-bold text-[var(--public-accent)]"
                          aria-hidden
                        >
                          ✓
                        </span>
                        <InlineCopy>{tSim(key)}</InlineCopy>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={cn(landingSectionBlockGap)}>
                <Button asChild size="lg" className={brandButtonClassName}>
                  <Link href="/app/simulation">{t('eligibility.cta')}</Link>
                </Button>
              </div>
            </Reveal>
          </section>

          <section className={cn(styles.sectionElevated, landingSectionPad)}>
            <Reveal className={landingContainer}>
              <div className={cn('grid items-center lg:grid-cols-[0.85fr_1.15fr]', landingGridGap)}>
                <div
                  className={cn(
                    'relative mx-auto aspect-square w-full max-w-sm overflow-hidden lg:max-w-none',
                    styles.imageFrame,
                    styles.leadImage,
                  )}
                >
                  <Image
                    src="/landing/advantages.jpg"
                    alt={t('advantages.imageAlt')}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 360px"
                  />
                </div>

                <div>
                  <h2 className={styles.sectionTitle}>{t('advantages.title')}</h2>
                  <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-3">
                    {advantages.map((key, index) => {
                      const Icon = ADVANTAGE_ICONS[index];
                      return (
                        <li key={key} className={cn(styles.advantageItem, 'flex items-start gap-3 px-4 py-3.5 text-sm sm:text-base')}>
                          <Icon className="mt-0.5 size-4 shrink-0 text-[var(--public-accent)]" aria-hidden />
                          <span className="font-medium">{t(`advantages.${key}`)}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </Reveal>
          </section>

          <section className={cn(styles.sectionBorderTop, landingSectionPad)}>
            <div className={landingContainer}>
              <Reveal>
                <h2 className={styles.sectionTitle}>{t('faq.title')}</h2>
                <div className="max-w-3xl">
                  <LandingFaq />
                  <Button asChild variant="link" className="mt-4 h-auto p-0 font-bold text-[var(--public-brand)]">
                    <Link href="/app/faq">{t('footer.faq')} →</Link>
                  </Button>
                </div>
              </Reveal>
            </div>
          </section>

          <section className={cn(styles.sectionMuted, landingSectionPad)}>
            <div className={landingContainer}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {VIDEOS.map(({ key, id }, index) => (
                  <Reveal key={key} delayMs={index * 80}>
                    <article className={cn(styles.videoCard)}>
                      <div className="aspect-video bg-neutral-900">
                        <iframe
                          src={`https://www.youtube.com/embed/${id}`}
                          title={t(`videos.items.${key}.title`)}
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          loading="lazy"
                        />
                      </div>
                      <p className={cn('px-4 py-3 text-sm leading-snug font-bold tracking-tight', styles.textBody)}>
                        {t(`videos.items.${key}.title`)}
                      </p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-[#121212] px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <h2 className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl">{t('finalCta.title')}</h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-300 sm:mt-5">
                <InlineCopy>{t('finalCta.body')}</InlineCopy>
              </p>
              <Button asChild size="lg" className={cn(landingSectionBlockGap, brandButtonClassName, 'h-12 px-8 text-base')}>
                <Link href="/app/simulation">{t('finalCta.cta')}</Link>
              </Button>
            </div>
          </section>
        </main>

        <PublicFooter />
      </div>
    </div>
  );
}
