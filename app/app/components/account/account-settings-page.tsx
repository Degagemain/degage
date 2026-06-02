'use client';

import { useTranslations } from 'next-intl';

import { ChangePasswordCard } from '@/app/components/account/change-password-card';
import { ConnectedProvidersCard } from '@/app/components/account/connected-providers-card';
import { UpdateNameCard } from '@/app/components/account/update-name-card';
import { getSocialProviders } from '@/app/components/auth/lib/auth-features';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { UpdateLocaleCard } from '@/app/components/update-locale-card';

export function AccountSettingsPage() {
  const t = useTranslations('auth');
  const hasSocialProviders = getSocialProviders().length > 0;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">{t('settings')}</h1>
      <Tabs defaultValue="profile" orientation="vertical" className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <TabsList variant="line" className="h-fit w-full shrink-0 sm:w-48">
          <TabsTrigger value="profile">{t('accountTabProfile')}</TabsTrigger>
          <TabsTrigger value="password">{t('accountTabPassword')}</TabsTrigger>
          {hasSocialProviders ? <TabsTrigger value="sign-in">{t('accountTabSignIn')}</TabsTrigger> : null}
        </TabsList>
        <div className="min-w-0 flex-1">
          <TabsContent value="profile" className="mt-0 space-y-6">
            <UpdateNameCard />
            <UpdateLocaleCard />
          </TabsContent>
          <TabsContent value="password" className="mt-0">
            <ChangePasswordCard />
          </TabsContent>
          {hasSocialProviders ? (
            <TabsContent value="sign-in" className="mt-0">
              <ConnectedProvidersCard />
            </TabsContent>
          ) : null}
        </div>
      </Tabs>
    </div>
  );
}
