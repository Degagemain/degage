'use client';

import { UpdateLocaleCard } from '@/app/components/update-locale-card';
import { ChangePasswordCard } from '@/app/components/account/change-password-card';
import { ConnectedProvidersCard } from '@/app/components/account/connected-providers-card';
import { UpdateNameCard } from '@/app/components/account/update-name-card';

export function AccountSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <UpdateNameCard />
      <ChangePasswordCard />
      <ConnectedProvidersCard />
      <UpdateLocaleCard />
    </div>
  );
}
