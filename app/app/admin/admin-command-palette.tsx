'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CornerDownLeft } from 'lucide-react';

import { CAR_SETTINGS_ITEMS, GEO_SETTINGS_ITEMS, MAIN_ITEMS, SIDEBAR_SETTINGS_ICONS } from '@/app/admin/nav-config';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/app/components/ui/command';

export function AdminCommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const t = useTranslations('admin');

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const run = React.useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title={t('command.title')}
      description={t('command.description')}
      footer={
        <>
          <CornerDownLeft className="size-4 shrink-0" />
          <span>{t('command.goToPage')}</span>
        </>
      }
    >
      <CommandInput placeholder={t('command.placeholder')} />
      <CommandList>
        <CommandEmpty>{t('command.empty')}</CommandEmpty>

        <CommandGroup heading={undefined}>
          {MAIN_ITEMS.map((item) => {
            const title = t(`${item.translationKey}.title`);
            return (
              <CommandItem key={item.href} value={title} onSelect={() => run(item.href)}>
                <item.icon />
                {title}
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandGroup heading={t('sidebar.carSettings')}>
          {CAR_SETTINGS_ITEMS.map((item) => {
            const title = t(`${item.translationKey}.title`);
            return (
              <CommandItem key={item.href} value={title} onSelect={() => run(item.href)}>
                <SIDEBAR_SETTINGS_ICONS.car />
                {title}
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandGroup heading={t('sidebar.geoSettings')}>
          {GEO_SETTINGS_ITEMS.map((item) => {
            const title = t(`${item.translationKey}.title`);
            return (
              <CommandItem key={item.href} value={title} onSelect={() => run(item.href)}>
                <SIDEBAR_SETTINGS_ICONS.geo />
                {title}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
