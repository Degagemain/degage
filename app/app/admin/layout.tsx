'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronsUpDown } from 'lucide-react';

import {
  ALL_PAGE_ITEMS,
  CAR_SETTINGS_ITEMS,
  GEO_SETTINGS_ITEMS,
  MAIN_ITEMS,
  SIDEBAR_SETTINGS_ICONS,
  SIMULATION_ITEMS,
} from '@/app/admin/nav-config';
import { AdminCommandPalette } from '@/app/admin/admin-command-palette';
import { authClient } from '@/app/lib/auth';
import { useIsAdmin } from '@/app/lib/role';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/components/ui/collapsible';
import { Separator } from '@/app/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/app/components/ui/sidebar';
import { Skeleton } from '@/app/components/ui/skeleton';
import { UserMenu } from '@/app/components/user-menu';

function usePageTitle(t: (key: string) => string) {
  const pathname = usePathname();
  const item = ALL_PAGE_ITEMS.find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));
  if (!item) return undefined;
  try {
    return t(item.titleKey);
  } catch {
    const key = 'translationKey' in item ? item.translationKey : '';
    return key ? key.charAt(0).toUpperCase() + key.slice(1) : undefined;
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations('admin');
  const { isAdmin, isPending } = useIsAdmin();
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const pageTitle = usePageTitle(t);

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

  const initials =
    session?.user?.name
      ?.split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? '?';

  return (
    <>
      <AdminCommandPalette />
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
              <SidebarGroupContent>
                <SidebarMenu>
                  {MAIN_ITEMS.map((item) => {
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

            <SidebarGroup>
              <SidebarGroupLabel>{t('sidebar.settings')}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <Collapsible defaultOpen={false} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={t('sidebar.simulation')}>
                          <SIDEBAR_SETTINGS_ICONS.simulation />
                          <span>{t('sidebar.simulation')}</span>
                          <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {SIMULATION_ITEMS.map((item) => {
                            const title = t(`${item.translationKey}.title`);
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                              <SidebarMenuSubItem key={item.href}>
                                <SidebarMenuSubButton asChild isActive={isActive}>
                                  <Link href={item.href}>
                                    <span>{title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>

                  <Collapsible defaultOpen={false} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={t('sidebar.carSettings')}>
                          <SIDEBAR_SETTINGS_ICONS.car />
                          <span>{t('sidebar.carSettings')}</span>
                          <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {CAR_SETTINGS_ITEMS.map((item) => {
                            const title = t(`${item.translationKey}.title`);
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                              <SidebarMenuSubItem key={item.href}>
                                <SidebarMenuSubButton asChild isActive={isActive}>
                                  <Link href={item.href}>
                                    <span>{title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>

                  <Collapsible defaultOpen={false} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={t('sidebar.geoSettings')}>
                          <SIDEBAR_SETTINGS_ICONS.geo />
                          <span>{t('sidebar.geoSettings')}</span>
                          <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {GEO_SETTINGS_ITEMS.map((item) => {
                            const title = t(`${item.translationKey}.title`);
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                              <SidebarMenuSubItem key={item.href}>
                                <SidebarMenuSubButton asChild isActive={isActive}>
                                  <Link href={item.href}>
                                    <span>{title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                {isSessionPending ? (
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 group-data-[collapsible=icon]:hidden">
                      <Skeleton className="mb-1 h-3 w-20" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                ) : session ? (
                  <SidebarMenuButton size="lg" tooltip={session.user.name}>
                    <Avatar size="sm">
                      {session.user.image && <AvatarImage src={session.user.image} alt={session.user.name} />}
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col gap-0.5 leading-none">
                      <span className="truncate text-sm font-medium">{session.user.name}</span>
                      <span className="text-muted-foreground truncate text-xs">{session.user.email}</span>
                    </div>
                    <ChevronsUpDown className="text-muted-foreground ml-auto h-4 w-4 shrink-0" />
                  </SidebarMenuButton>
                ) : null}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b px-4 backdrop-blur">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {pageTitle && <span className="text-sm font-semibold">{pageTitle}</span>}
            <div className="ml-auto flex items-center gap-2">
              {isSessionPending ? (
                <Skeleton className="h-8 w-8 rounded-full" />
              ) : session ? (
                <UserMenu name={session.user.name} email={session.user.email} image={session.user.image} size="sm" />
              ) : null}
            </div>
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
