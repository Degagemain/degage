'use client';

import { PublicShell } from '@/app/components/public/public-shell';

export default function SimulationLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell heroGlow>{children}</PublicShell>;
}
