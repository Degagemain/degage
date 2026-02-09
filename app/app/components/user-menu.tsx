'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { LogOut, Monitor, Moon, Settings, Shield, Sun } from 'lucide-react';
import { toast } from 'sonner';

import { localeDisplayNames, uiLocales } from '@/i18n/locales';
import { authClient } from '@/app/lib/auth';
import { useIsAdmin } from '@/app/lib/role';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
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
  name: string;
  email: string;
  image?: string | null;
  size?: 'sm' | 'default';
}

export function UserMenu({ name, email, image, size = 'default' }: UserMenuProps) {
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
    const response = await fetch('/api/user/locale', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: newLocale }),
    });
    if (!response.ok) {
      toast.error(t('updateFailed'));
      return;
    }
    toast.success(localeDisplayNames[newLocale as keyof typeof localeDisplayNames]);
    router.refresh();
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const buttonSize = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';
  const avatarSize = size === 'sm' ? 'sm' : 'default';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`relative ${buttonSize} rounded-full`}>
          <Avatar size={avatarSize}>
            {image && <AvatarImage src={image} alt={name} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">{name}</p>
            <p className="text-muted-foreground text-xs leading-none">{email}</p>
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
