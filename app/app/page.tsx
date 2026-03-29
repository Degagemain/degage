'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { MessagesSquare } from 'lucide-react';
import { useEffect, useState } from 'react';

import { authClient } from '@/app/lib/auth';
import { useIsAdmin } from '@/app/lib/role';
import { useSupportChat } from '@/app/components/support-chat-provider';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';

export default function HomePage() {
  const { data: session, isPending } = authClient.useSession();
  const { openChat } = useSupportChat();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isPending) {
    return (
      <main className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </main>
    );
  }

  return (
    <>
      {session ? (
        <AuthenticatedHome name={session.user.name || session.user.email} onOpenChat={openChat} />
      ) : (
        <PublicHome onOpenChat={openChat} />
      )}
    </>
  );
}

function PublicHome({ onOpenChat }: { onOpenChat: () => void }) {
  const t = useTranslations('chat');

  return (
    <main className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">Coming soon</h1>
        <p className="text-muted-foreground text-lg">Something cool is on the way. Stay tuned!</p>
        <div className="mt-6">
          <Button type="button" variant="outline" className="gap-2" onClick={onOpenChat}>
            <MessagesSquare className="size-4 shrink-0" aria-hidden />
            {t('supportChat')}
          </Button>
        </div>
      </div>
    </main>
  );
}

function AuthenticatedHome({ name, onOpenChat }: { name: string; onOpenChat: () => void }) {
  const { isAdmin } = useIsAdmin();
  const t = useTranslations('chat');

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {name}</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your account.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t('openChatCardTitle')}</CardTitle>
            <CardDescription>{t('openChatCardDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={onOpenChat}>
              <MessagesSquare className="size-4 shrink-0" aria-hidden />
              {t('supportChat')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your profile and preferences.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" asChild>
              <Link href="/app/account/settings">Go to settings</Link>
            </Button>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Admin</CardTitle>
              <CardDescription>Manage users and reference data.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" asChild>
                <Link href="/app/admin">Go to admin</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
