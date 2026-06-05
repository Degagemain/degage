'use client';

import { PublicShell } from '@/app/components/public/public-shell';

import { FaqSupportFab } from './components/faq-support-fab';

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicShell heroGlow>
      {children}
      <FaqSupportFab />
    </PublicShell>
  );
}
