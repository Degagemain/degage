'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { LogOut, Monitor, Moon, Settings, Shield, Sun } from 'lucide-react';
import { toast } from 'sonner';

import { localeDisplayNames, uiLocales } from '@/i18n/locales';
import { apiPatch } from '@/app/lib/api-client';
import { authClient } from '@/app/lib/auth';
import { trackLocaleChanged } from '@/app/lib/posthog-events';
import { useIsAdmin } from '@/app/lib/role';
import { cn } from '@/app/lib/utils';
import { Avatar, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface UserMenuProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  size?: 'sm' | 'default';
}

export function UserMenu({ name, email, image, size = 'default' }: UserMenuProps) {
  const displayName = name || email || '';
  const displayEmail = email || '';
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('language');
  const tTheme = useTranslations('theme');
  const tAuth = useTranslations('auth');
  const tAdmin = useTranslations('admin');
  const { isAdmin } = useIsAdmin();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  const switchLocale = async (newLocale: string) => {
    if (newLocale === locale) return;
    const response = await apiPatch('/api/user/locale', { locale: newLocale });
    if (!response.ok) {
      toast.error(t('updateFailed'));
      return;
    }
    trackLocaleChanged(locale, newLocale, 'menu');
    toast.success(localeDisplayNames[newLocale as keyof typeof localeDisplayNames]);
    router.refresh();
  };

  const buttonSize = size === 'sm' ? 'h-8' : 'h-9';
  const avatarSize = size === 'sm' ? 'sm' : 'default';
  const triggerLabel = name?.trim() || email?.trim() || '?';
  const profileImage = image?.trim() || null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn('relative max-w-[min(100%,12rem)] rounded-full', buttonSize, profileImage ? 'gap-2 px-2' : 'px-3')}
        >
          {profileImage ? (
            <Avatar size={avatarSize}>
              <AvatarImage src={profileImage} alt={triggerLabel} />
            </Avatar>
          ) : null}
          <span className="truncate text-sm font-medium">{triggerLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">{displayName}</p>
            <p className="text-muted-foreground text-xs leading-none">{displayEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/app/admin">
                <Shield className="mr-2 h-4 w-4" />
                {tAdmin('sidebar.panel')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">{t('label')}</DropdownMenuLabel>
        {uiLocales.map((code) => (
          <DropdownMenuItem key={code} onClick={() => switchLocale(code)} className={locale === code ? 'bg-accent' : ''}>
            {localeDisplayNames[code]}
          </DropdownMenuItem>
        ))}
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">{tTheme('label')}</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setTheme('light')} className={(theme ?? 'system') === 'light' ? 'bg-accent' : ''}>
              <span className="flex w-full items-center justify-between">
                {tTheme('light')}
                <Sun className="h-4 w-4" />
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')} className={(theme ?? 'system') === 'dark' ? 'bg-accent' : ''}>
              <span className="flex w-full items-center justify-between">
                {tTheme('dark')}
                <Moon className="h-4 w-4" />
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')} className={(theme ?? 'system') === 'system' ? 'bg-accent' : ''}>
              <span className="flex w-full items-center justify-between">
                {tTheme('automatic')}
                <Monitor className="h-4 w-4" />
              </span>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/app/account/settings">
            <Settings className="mr-2 h-4 w-4" />
            {tAuth('settings')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} variant="destructive">
          <LogOut className="mr-2 h-4 w-4" />
          {tAuth('signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
