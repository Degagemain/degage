'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Users } from 'lucide-react';

import { authClient } from '@/app/lib/auth';
import { useIsAdmin } from '@/app/lib/role';
import { Separator } from '@/app/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/app/components/ui/sidebar';
import { Skeleton } from '@/app/components/ui/skeleton';
import { UserMenu } from '@/app/components/user-menu';

const SIDEBAR_ITEMS = [
  {
    translationKey: 'users' as const,
    href: '/app/admin/users',
    icon: Users,
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations('admin');
  const { isAdmin, isPending } = useIsAdmin();
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Access Denied</h1>
          <p className="text-muted-foreground mt-2">You do not have permission to access this area.</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild tooltip={t('sidebar.backToApp')}>
                <Link href="/app">
                  <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg text-xs font-semibold">
                    N
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">Neurotic</span>
                    <span className="text-muted-foreground text-xs">{t('menu')}</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t('sidebar.administration')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {SIDEBAR_ITEMS.map((item) => {
                  const title = t(`${item.translationKey}.title`);
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={title}>
                        <Link href={item.href}>
                          <item.icon />
                          <span>{title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="bg-background sticky top-0 z-50 flex h-14 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <span className="text-muted-foreground text-sm">{t('sidebar.panel')}</span>
          </div>
          <div className="flex items-center gap-2">
            {isSessionPending ? (
              <Skeleton className="h-8 w-8 rounded-full" />
            ) : session ? (
              <UserMenu name={session.user.name} email={session.user.email} image={session.user.image} size="sm" />
            ) : null}
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
