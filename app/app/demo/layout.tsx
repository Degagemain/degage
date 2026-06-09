'use client';

import { PublicShell } from '@/app/components/public/public-shell';

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell>{children}</PublicShell>;
}
