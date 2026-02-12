'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Check, Filter } from 'lucide-react';

import { cn } from '@/app/lib/utils';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/app/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { Separator } from '@/app/components/ui/separator';
import { Skeleton } from '@/app/components/ui/skeleton';

const OPTIONS_PAGE_SIZE = 50;

function useIntersectionObserver(
  ref: React.RefObject<HTMLElement | null>,
  onReached: () => void,
  options: { root: HTMLElement | null; enabled: boolean },
) {
  const onReachedRef = React.useRef(onReached);
  onReachedRef.current = onReached;
  React.useEffect(() => {
    const el = ref.current;
    const root = options.root;
    if (!el || !root || !options.enabled) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onReachedRef.current();
      },
      { root, rootMargin: '100px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, options.root, options.enabled]);
}

export interface SearchableOption {
  id: string;
  name: string;
}

interface DataTableSearchableMultiselectProps {
  title: string;
  apiPath: string;
  selectedValues: string[];
  selectedOptions: SearchableOption[];
  onSelectedChange: (values: string[], options: SearchableOption[]) => void;
  placeholder?: string;
}

export function DataTableSearchableMultiselect({
  title,
  apiPath,
  selectedValues,
  selectedOptions,
  onSelectedChange,
  placeholder,
}: DataTableSearchableMultiselectProps) {
  const t = useTranslations('dataTable.facetedFilter');
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [options, setOptions] = React.useState<SearchableOption[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const selectedSet = new Set(selectedValues);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchPage = React.useCallback(
    async (skip: number, append: boolean) => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('query', debouncedSearch);
      params.set('skip', String(skip));
      params.set('take', String(OPTIONS_PAGE_SIZE));
      const res = await fetch(`/api/${apiPath}?${params.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      const records = (data.records ?? []).map((r: { id: string; name: string }) => ({ id: r.id, name: r.name }));
      if (append) {
        setOptions((prev) => (skip === 0 ? records : [...prev, ...records]));
      } else {
        setOptions(records);
      }
      setTotal(data.total ?? 0);
    },
    [apiPath, debouncedSearch],
  );

  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchPage(0, false).finally(() => setLoading(false));
  }, [open, debouncedSearch, fetchPage]);

  const loadMore = React.useCallback(() => {
    if (options.length >= total || loadingMore) return;
    setLoadingMore(true);
    fetchPage(options.length, true).finally(() => setLoadingMore(false));
  }, [options.length, total, loadingMore, fetchPage]);

  const [scrollRoot, setScrollRoot] = React.useState<HTMLElement | null>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const canLoadMore = options.length < total && !loading && !loadingMore;
  useIntersectionObserver(sentinelRef, loadMore, {
    root: scrollRoot,
    enabled: open && canLoadMore && options.length > 0,
  });

  const handleSelect = (option: SearchableOption) => {
    const newSet = new Set(selectedValues);
    const newOptions = selectedOptions.filter((o) => o.id !== option.id);
    if (newSet.has(option.id)) {
      newSet.delete(option.id);
    } else {
      newSet.add(option.id);
      newOptions.push(option);
    }
    onSelectedChange(Array.from(newSet), newOptions);
  };

  const handleClear = () => {
    onSelectedChange([], []);
  };

  const displayOptions = React.useMemo(() => {
    const optionIds = new Set(options.map((o) => o.id));
    const selectedNotInList = selectedOptions.filter((o) => selectedSet.has(o.id) && !optionIds.has(o.id));
    return [...selectedNotInList, ...options];
  }, [selectedOptions, selectedSet, options]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="text-muted-foreground h-9 border-dashed font-normal">
          <Filter className="mr-2 h-3.5 w-3.5" />
          {title}
          {selectedSet.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedSet.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedSet.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {t('selected', { count: selectedSet.size })}
                  </Badge>
                ) : (
                  selectedOptions.map((o) => (
                    <Badge variant="secondary" key={o.id} className="rounded-sm px-1 font-normal">
                      {o.name}
                    </Badge>
                  ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder={placeholder ?? title} value={search} onValueChange={setSearch} />
          <div ref={setScrollRoot} className="max-h-[300px] overflow-y-auto">
            <CommandList className="max-h-none">
              {loading ? (
                <div className="flex flex-col gap-1 p-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <CommandEmpty>{t('noResults')}</CommandEmpty>
                  <CommandGroup>
                    {displayOptions.map((option) => {
                      const isSelected = selectedSet.has(option.id);
                      return (
                        <CommandItem key={option.id} onSelect={() => handleSelect(option)} value={option.id}>
                          <div
                            className={cn(
                              'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                              isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible',
                            )}
                          >
                            <Check className="h-4 w-4" />
                          </div>
                          <span>{option.name}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                  {canLoadMore && <div ref={sentinelRef} className="h-2 flex-shrink-0" aria-hidden />}
                  {loadingMore && (
                    <div className="flex justify-center py-2">
                      <span className="text-muted-foreground text-xs">…</span>
                    </div>
                  )}
                  {selectedSet.size > 0 && (
                    <>
                      <CommandSeparator />
                      <CommandGroup>
                        <CommandItem onSelect={handleClear} className="justify-center text-center">
                          {t('clearFilters')}
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </>
              )}
            </CommandList>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
