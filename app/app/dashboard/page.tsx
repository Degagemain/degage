'use client';

import { authClient } from '@/app/lib/auth';
import { DashboardPage } from '@/app/components/dashboard/dashboard-page';

export default function DashboardRoute() {
  const { data: session } = authClient.useSession();
  const name = session?.user.name?.trim() || session?.user.email?.trim() || '';

  return <DashboardPage name={name} />;
}
