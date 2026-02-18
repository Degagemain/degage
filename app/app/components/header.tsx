'use client';

import Link from 'next/link';

import { authClient } from '@/app/lib/auth';
import { Skeleton } from './ui/skeleton';
import { LanguageSwitcher } from './language-switcher';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';

export function Header() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <header className="bg-background sticky top-0 z-50 border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/app" className="text-xl font-semibold" aria-label="Home">
            &nbsp;
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {!session && (
            <>
              <LanguageSwitcher />
              <ThemeToggle />
            </>
          )}

          {isPending ? (
            <Skeleton className="h-9 w-9 rounded-full" />
          ) : session ? (
            <UserMenu name={session.user.name} email={session.user.email} image={session.user.image} />
          ) : null}
        </div>
      </div>
    </header>
  );
}
