'use client';

import { cn } from '@/app/lib/utils';

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
    <div className={cn(styles.publicTheme, styles.pageSurface, 'min-h-screen', heroGlow && 'relative overflow-x-hidden', className)}>
      {heroGlow && <PublicHeroGlow />}
      <PublicHeader />
      <main className={cn(publicMainPadTop, heroGlow && 'relative')}>{children}</main>
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
