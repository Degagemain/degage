'use client';

import { PublicBrandHeader, PublicBrandShell } from '@/app/components/public-brand-shell';

import { FaqSupportFab } from './components/faq-support-fab';

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicBrandShell>
      <PublicBrandHeader />
      {children}
      <FaqSupportFab />
    </PublicBrandShell>
  );
}
