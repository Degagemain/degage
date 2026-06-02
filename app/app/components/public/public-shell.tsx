'use client';

import { cn } from '@/app/lib/utils';

import { PublicHeader } from './public-header';
import { publicContainer, publicContainerNarrow, publicMainPadTop, publicPagePad } from './public-layout';
import styles from './public-theme.module.css';

type PublicShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function PublicShell({ children, className }: PublicShellProps) {
  return (
    <div className={cn(styles.publicTheme, 'min-h-screen bg-[#fafaf9] text-[#1c1917]', className)}>
      <PublicHeader />
      <main className={publicMainPadTop}>{children}</main>
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
