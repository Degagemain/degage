'use client';

import * as React from 'react';
import { ChevronDownIcon } from 'lucide-react';

import { cn } from '@/app/lib/utils';
import { Button } from '@/app/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/app/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { Skeleton } from '@/app/components/ui/skeleton';

const PAGE_SIZE = 30;

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

export interface SearchableSelectProps {
  value: string;
  selectedLabel?: string;
  onValueChange: (id: string, option: SearchableOption) => void;
  apiPath: string;
  /** Optional query params appended to every request (e.g. brandId, fuelTypeId for filtered lists). */
  queryParams?: Record<string, string>;
  /** Options appended to the end of the list (e.g. "Other" fallback). */
  appendOptions?: SearchableOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
}

export function SearchableSelect({
  value,
  selectedLabel,
  onValueChange,
  apiPath,
  queryParams,
  appendOptions = [],
  placeholder = 'Select…',
  disabled,
  className,
  triggerClassName,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [options, setOptions] = React.useState<SearchableOption[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchPage = React.useCallback(
    async (skip: number, append: boolean) => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('query', debouncedSearch);
      params.set('skip', String(skip));
      params.set('take', String(PAGE_SIZE));
      if (queryParams) {
        for (const [k, v] of Object.entries(queryParams)) {
          if (v) params.set(k, v);
        }
      }
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
    [apiPath, debouncedSearch, queryParams],
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

  const handleSelect = React.useCallback(
    (option: SearchableOption) => {
      onValueChange(option.id, option);
      setOpen(false);
      setSearch('');
    },
    [onValueChange],
  );

  const allOptions = [...options, ...appendOptions];
  const displayLabel = selectedLabel ?? (value ? (allOptions.find((o) => o.id === value)?.name ?? value) : null);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('data-[placeholder]:text-muted-foreground w-full justify-between font-normal', triggerClassName, className)}
        >
          <span className={cn(!displayLabel && 'text-muted-foreground')}>{displayLabel ?? placeholder}</span>
          <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search…" value={search} onValueChange={setSearch} />
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
                  <CommandEmpty>No results.</CommandEmpty>
                  <CommandGroup>
                    {allOptions.map((option) => (
                      <CommandItem
                        key={option.id}
                        value={option.id}
                        onSelect={() => handleSelect(option)}
                        className={cn(value === option.id && 'bg-accent')}
                      >
                        {option.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {canLoadMore && <div ref={sentinelRef} className="h-2 flex-shrink-0" aria-hidden />}
                  {loadingMore && (
                    <div className="flex justify-center py-2">
                      <span className="text-muted-foreground text-xs">Loading…</span>
                    </div>
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
