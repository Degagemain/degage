'use client';

import { useEffect, useState } from 'react';

import { authClient } from '@/app/lib/auth';
import { DashboardPage } from '@/app/components/dashboard/dashboard-page';

export default function DashboardRoute() {
  const { data: session } = authClient.useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const name = mounted ? session?.user.name?.trim() || session?.user.email?.trim() || '' : '';

  return <DashboardPage name={name} />;
}
