'use client';

import * as React from 'react';
import styles from '../simulation.module.css';

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

export interface SearchDropdownOption {
  id: string;
  name: string;
  [key: string]: string | boolean | number | undefined;
}

export interface SearchDropdownProps {
  value: string;
  selectedLabel?: string;
  onValueChange: (id: string, option: SearchDropdownOption) => void;
  apiPath: string;
  queryParams?: Record<string, string>;
  labelKey?: string;
  passThroughKeys?: string[];
  appendOptions?: SearchDropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SearchDropdown({
  value,
  selectedLabel,
  onValueChange,
  apiPath,
  queryParams,
  labelKey = 'name',
  passThroughKeys = [],
  appendOptions = [],
  placeholder = 'Select…',
  disabled,
  className = '',
}: SearchDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [options, setOptions] = React.useState<SearchDropdownOption[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

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
      const records = (data.records ?? []).map((r: Record<string, unknown>) => {
        const option: SearchDropdownOption = {
          id: String(r.id),
          name: (r[labelKey] as string) ?? (r.name as string) ?? '',
        };
        for (const key of passThroughKeys) {
          const val = r[key];
          if (typeof val === 'boolean' || typeof val === 'string' || typeof val === 'number') {
            option[key] = val;
          }
        }
        return option;
      });
      if (append) {
        setOptions((prev) => (skip === 0 ? records : [...prev, ...records]));
      } else {
        setOptions(records);
      }
      setTotal(data.total ?? 0);
    },
    [apiPath, debouncedSearch, queryParams, labelKey, passThroughKeys],
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

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allOptions = [...options, ...appendOptions];
  const displayLabel = selectedLabel ?? (value ? (allOptions.find((o) => o.id === value)?.name ?? '') : null);

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className={styles.searchDropdownTrigger}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={!displayLabel ? styles.searchDropdownPlaceholder : ''}>{displayLabel || placeholder}</span>
        <span aria-hidden className={styles.searchDropdownChevron}>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div className={styles.searchDropdownList} role="listbox">
          <input
            type="text"
            className={styles.searchDropdownInput}
            placeholder="Zoeken…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div ref={setScrollRoot} className={styles.searchDropdownScroll}>
            {loading ? (
              <div className={styles.searchDropdownStatus}>Laden…</div>
            ) : (
              <>
                {allOptions.length === 0 && !loading && <div className={styles.searchDropdownStatus}>Geen resultaten.</div>}
                {allOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={value === option.id}
                    className={`${styles.searchDropdownItem} ${value === option.id ? styles.searchDropdownItemSelected : ''}`}
                    onClick={() => {
                      onValueChange(option.id, option);
                      setOpen(false);
                      setSearch('');
                    }}
                  >
                    {option.name}
                  </button>
                ))}
                {canLoadMore && <div ref={sentinelRef} className={styles.searchDropdownSentinel} aria-hidden />}
                {loadingMore && <div className={styles.searchDropdownStatus}>Laden…</div>}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
