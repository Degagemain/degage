'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Car,
  CarFront,
  Coins,
  Globe2,
  Leaf,
  ParkingCircle,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { LandingHeader } from '@/app/components/landing/landing-header';
import {
  landingBenefitsPad,
  landingContainer,
  landingEyebrowToTitle,
  landingFooterPad,
  landingGridGap,
  landingHeroPad,
  landingSectionBlockGap,
  landingSectionPad,
  landingTitleToBody,
} from '@/app/components/landing/landing-layout';
import styles from '@/app/components/public/public-theme.module.css';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/app/components/ui/accordion';
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

const brandButtonClassName =
  'h-12 rounded-full bg-[var(--public-brand)] px-8 text-base text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--public-brand-hover)] hover:shadow-md';

type LandingPageProps = {
  onOpenChat: () => void;
};

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

export function LandingPage({ onOpenChat }: LandingPageProps) {
  const t = useTranslations('landing');
  const tSim = useTranslations('simulationPublic.situatie');
  const tChat = useTranslations('chat');

  const benefits = ['cheaper', 'flexible', 'environment', 'community'] as const;
  const advantages = ['billing', 'insurance', 'platform', 'damage', 'breakdown', 'access', 'parking'] as const;
  const faqs = ['schedule', 'insurance', 'effort'] as const;

  return (
    <div className={styles.publicTheme}>
      <LandingHeader />

      <div className={cn('relative min-h-screen overflow-x-hidden', styles.pageSurface)}>
        <div aria-hidden className={cn('pointer-events-none absolute inset-x-0 top-0 h-[520px]', styles.heroGlow)} />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-[rgb(var(--public-glow-mint)/0.35)] blur-3xl motion-safe:animate-pulse"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-[38rem] -left-20 h-72 w-72 rounded-full bg-[rgb(var(--public-glow)/0.22)] blur-3xl motion-safe:animate-pulse"
        />

        <main>
          <section className={cn('relative', landingContainer, landingHeroPad)}>
            <div className="mx-auto max-w-3xl text-center">
              <Reveal>
                <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">{t('hero.title')}</h1>
              </Reveal>
              <Reveal delayMs={90}>
                <p className={cn(landingTitleToBody, 'text-lg leading-relaxed sm:text-xl', styles.textMuted)}>{t('hero.subtitle')}</p>
              </Reveal>
              <Reveal delayMs={160}>
                <p className={cn('mx-auto mt-4 max-w-2xl text-base leading-relaxed', styles.textSubtle)}>{t('hero.intro')}</p>
              </Reveal>
              <Reveal delayMs={220}>
                <div className={cn(landingSectionBlockGap, 'flex flex-col items-center gap-2')}>
                  <Button asChild size="lg" className={brandButtonClassName}>
                    <Link href="/app/simulation">
                      {t('hero.cta')}
                      <ArrowRight className="size-4 transition-transform duration-300" aria-hidden />
                    </Link>
                  </Button>
                  <p className={cn('text-sm', styles.textSubtle)}>{t('hero.ctaHint')}</p>
                </div>
              </Reveal>
            </div>
          </section>

          <section className={cn(landingContainer, landingBenefitsPad)}>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
              {benefits.map((key, index) => {
                const Icon = BENEFIT_ICONS[index];
                return (
                  <Reveal key={key} delayMs={index * 80}>
                    <article
                      className={cn(
                        styles.benefitCard,
                        'rounded-2xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md',
                      )}
                    >
                      <div className="mb-4 inline-flex rounded-xl bg-[var(--public-icon-bg)] p-2.5 text-[var(--public-accent)]">
                        <Icon className="size-5" aria-hidden />
                      </div>
                      <h2 className="text-base font-semibold">{t(`benefits.${key}.title`)}</h2>
                      <p className={cn('mt-2 text-sm leading-relaxed', styles.textMuted)}>{t(`benefits.${key}.desc`)}</p>
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
                  <div className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium', styles.pillBadge)}>
                    <Globe2 className="size-4" aria-hidden />
                    {t('about.eyebrow')}
                  </div>
                  <h2 className={cn(landingEyebrowToTitle, 'text-3xl font-semibold tracking-tight sm:text-4xl')}>{t('about.title')}</h2>
                  <p className={cn(landingTitleToBody, 'text-lg leading-relaxed italic', styles.textBody)}>{t('about.lead')}</p>
                  <p className={cn('mt-4 text-base leading-relaxed', styles.textMuted)}>{t('about.paragraph1')}</p>
                  <p className={cn('mt-4 text-base leading-relaxed', styles.textMuted)}>{t('about.paragraph2')}</p>
                  <p className={cn('mt-4 text-base leading-relaxed', styles.textMuted)}>{t('about.paragraph3')}</p>

                  <dl className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
                    {ABOUT_STATS.map((key) => (
                      <div
                        key={key}
                        className="rounded-2xl border border-[var(--public-border)] bg-[var(--public-surface)] px-4 py-4 text-center"
                      >
                        <dt className="text-2xl font-semibold tracking-tight text-[var(--public-accent-deep)]">
                          {t(`about.stats.${key}.value`)}
                        </dt>
                        <dd className={cn('mt-1 text-sm', styles.textMuted)}>{t(`about.stats.${key}.label`)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div
                  className={cn(
                    'relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-3xl shadow-lg lg:max-w-none',
                    styles.imageFrame,
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
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-semibold tracking-wide text-[var(--public-accent)] uppercase">{t('eligibility.eyebrow')}</p>
                <h2 className={cn(landingEyebrowToTitle, 'text-3xl font-semibold tracking-tight sm:text-4xl')}>{t('eligibility.title')}</h2>
                <p className={cn(landingTitleToBody, 'text-base leading-relaxed', styles.textMuted)}>{t('eligibility.body')}</p>
              </div>

              <div className={cn(landingSectionBlockGap, 'grid gap-5 sm:gap-6 lg:grid-cols-2')}>
                <div className="rounded-2xl border border-red-100 bg-red-50/40 p-6 sm:p-8 dark:border-red-900/50 dark:bg-red-950/30">
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-200">{tSim('koopgidsKnockoutTitle')}</h3>
                  <ul className="mt-5 space-y-3">
                    {KNOCKOUT_KEYS.map((key) => (
                      <li key={key} className={cn('flex gap-3 text-sm leading-relaxed sm:text-base', styles.textBody)}>
                        <span
                          className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700 dark:bg-red-950 dark:text-red-300"
                          aria-hidden
                        >
                          !
                        </span>
                        {tSim(key)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-[var(--public-border)] bg-[var(--public-surface)]/80 p-6 sm:p-8">
                  <h3 className="text-lg font-semibold text-[var(--public-accent-deep)]">{tSim('koopgidsIdealTitle')}</h3>
                  <ul className="mt-5 space-y-3">
                    {IDEAL_KEYS.map((key) => (
                      <li key={key} className={cn('flex gap-3 text-sm leading-relaxed sm:text-base', styles.textBody)}>
                        <span
                          className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--public-surface-muted)] text-xs font-bold text-[var(--public-accent)]"
                          aria-hidden
                        >
                          ✓
                        </span>
                        {tSim(key)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={cn(landingSectionBlockGap, 'flex justify-center')}>
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
                    'relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-3xl shadow-lg lg:max-w-none',
                    styles.imageFrame,
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
                  <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('advantages.title')}</h2>
                  <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4">
                    {advantages.map((key, index) => {
                      const Icon = ADVANTAGE_ICONS[index];
                      return (
                        <li
                          key={key}
                          className={cn(
                            styles.advantageItem,
                            'flex items-start gap-3 rounded-xl px-4 py-3.5 text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm sm:text-base',
                          )}
                        >
                          <Icon className="mt-0.5 size-4 shrink-0 text-[var(--public-accent)]" aria-hidden />
                          <span>{t(`advantages.${key}`)}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </Reveal>
          </section>

          <section className={cn(styles.sectionBorderTop, landingSectionPad)}>
            <div className={cn(landingContainer, 'grid items-start lg:grid-cols-[1.1fr_0.9fr]', landingGridGap)}>
              <Reveal>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t('faq.title')}</h2>
                <Accordion type="single" collapsible defaultValue={faqs[0]} className="mt-6">
                  {faqs.map((key) => (
                    <AccordionItem key={key} value={key} className="border-[var(--public-image-border)]">
                      <AccordionTrigger className={cn('py-3 text-base font-medium hover:no-underline', styles.textHeading)}>
                        {t(`faq.${key}.q`)}
                      </AccordionTrigger>
                      <AccordionContent className={cn('text-sm leading-relaxed', styles.textMuted)}>{t(`faq.${key}.a`)}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                <Button asChild variant="link" className="mt-4 h-auto p-0 text-[var(--public-accent)]">
                  <Link href="/app/faq">{t('footer.faq')} →</Link>
                </Button>
              </Reveal>

              <Reveal
                delayMs={120}
                className={cn('relative aspect-[3/2] w-full overflow-hidden rounded-2xl shadow-md lg:sticky lg:top-24', styles.imageFrame)}
              >
                <Image src="/landing/hero.jpg" alt={t('faq.imageAlt')} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 480px" />
              </Reveal>
            </div>
          </section>

          <section className={cn(styles.sectionMuted, landingSectionPad)}>
            <div className={landingContainer}>
              <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {VIDEOS.map(({ key, id }, index) => (
                  <Reveal key={key} delayMs={index * 100}>
                    <article
                      className={cn(
                        styles.videoCard,
                        'overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md',
                      )}
                    >
                      <div className="aspect-video bg-stone-900">
                        <iframe
                          src={`https://www.youtube.com/embed/${id}`}
                          title={t(`videos.items.${key}.title`)}
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          loading="lazy"
                        />
                      </div>
                      <p className={cn('px-4 py-3 text-sm leading-snug font-medium', styles.textBody)}>{t(`videos.items.${key}.title`)}</p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section className={cn(landingContainer, 'pb-20 sm:pb-24')}>
            <div className="rounded-3xl bg-[var(--public-brand)] px-6 py-12 text-center text-white sm:px-10 sm:py-14 lg:px-12 lg:py-16">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('finalCta.title')}</h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[var(--public-on-brand-muted)]/90 sm:mt-5">
                {t('finalCta.body')}
              </p>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className={cn(landingSectionBlockGap, 'h-12 rounded-full px-8 text-base text-[var(--public-brand)]')}
              >
                <Link href="/app/simulation">{t('finalCta.cta')}</Link>
              </Button>
            </div>
          </section>
        </main>

        <footer className={cn(styles.sectionElevated, landingFooterPad)}>
          <div className={cn(landingContainer, 'flex flex-col items-center justify-between gap-4 text-sm sm:flex-row', styles.textFooter)}>
            <p className={cn('font-semibold', styles.textFooterStrong)}>{t('brand')}</p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <Link href="/app/faq" className={cn('hover:text-[var(--public-text-footer-strong)]')}>
                {t('footer.faq')}
              </Link>
              <button type="button" className="hover:text-[var(--public-text-footer-strong)]" onClick={onOpenChat}>
                {tChat('supportChat')}
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
