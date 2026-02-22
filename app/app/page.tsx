'use client';

import Link from 'next/link';

import { authClient } from '@/app/lib/auth';
import { useIsAdmin } from '@/app/lib/role';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';

export default function HomePage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <main className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </main>
    );
  }

  if (session) {
    return <AuthenticatedHome name={session.user.name || session.user.email} />;
  }

  return <PublicHome />;
}

function PublicHome() {
  return (
    <main className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">Coming soon</h1>
        <p className="text-muted-foreground text-lg">Something cool is on the way. Stay tuned!</p>
      </div>
    </main>
  );
}

function AuthenticatedHome({ name }: { name: string }) {
  const { isAdmin } = useIsAdmin();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {name}</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your account.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
