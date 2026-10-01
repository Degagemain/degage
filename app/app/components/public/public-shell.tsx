'use client';

import { cn } from '@/app/lib/utils';

import { publicSans } from './public-fonts';
import { PublicFooter } from './public-footer';
import { PublicHeroGlow } from './public-hero-glow';
import { PublicHeader } from './public-header';
import { publicContainer, publicContainerNarrow, publicMainPadTop, publicPagePad } from './public-layout';
import styles from './public-theme.module.css';

type PublicShellProps = {
  children: React.ReactNode;
  className?: string;
  heroGlow?: boolean;
};

export function PublicShell({ children, className, heroGlow }: PublicShellProps) {
  return (
    <div
      className={cn(
        publicSans.variable,
        publicSans.className,
        styles.publicTheme,
        styles.pageSurface,
        'flex min-h-screen flex-col',
        heroGlow && 'relative overflow-x-hidden',
        className,
      )}
    >
      {heroGlow && <PublicHeroGlow />}
      <PublicHeader />
      <main className={cn(publicMainPadTop, 'flex-1', heroGlow && 'relative')}>{children}</main>
      <PublicFooter />
    </div>
  );
}

type PublicPageProps = {
  children: React.ReactNode;
  narrow?: boolean;
  className?: string;
};

export function PublicPage({ children, narrow, className }: PublicPageProps) {
  return <div className={cn(narrow ? publicContainerNarrow : publicContainer, publicPagePad, className)}>{children}</div>;
}
