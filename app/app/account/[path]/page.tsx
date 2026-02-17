import { AccountSettingsCards, AccountView } from '@daveyplate/better-auth-ui';
import { accountViewPaths } from '@daveyplate/better-auth-ui/server';
import { UpdateLocaleCard } from '@/app/components/update-locale-card';

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(accountViewPaths).map((path) => ({ path }));
}

export default async function AccountPage({ params }: { params: Promise<{ path: string }> }) {
  const { path } = await params;

  // For settings page, use custom layout with locale card
  if (path === 'settings') {
    return (
      <main className="container max-w-xl space-y-6 p-4 md:p-6">
        <AccountSettingsCards />
        <UpdateLocaleCard />
      </main>
    );
  }

  return (
    <main className="container p-4 md:p-6">
      <AccountView path={path} />
    </main>
  );
}
