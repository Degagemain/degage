import { cn } from '@/app/lib/utils';

import styles from './public-theme.module.css';

export function PublicHeroGlow() {
  return (
    <>
      <div aria-hidden className={cn('pointer-events-none absolute inset-x-0 top-0 h-[520px]', styles.heroGlow)} />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-[rgb(var(--public-glow-mint)/0.35)] blur-3xl motion-safe:animate-pulse"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[38rem] -left-20 h-72 w-72 rounded-full bg-[rgb(var(--public-glow)/0.22)] blur-3xl motion-safe:animate-pulse"
      />
    </>
  );
}
