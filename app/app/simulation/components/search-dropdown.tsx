'use client';

import * as React from 'react';
import styles from '../simulation.module.css';

const PAGE_SIZE = 30;

export interface SearchDropdownOption {
  id: string;
  name: string;
}

export interface SearchDropdownProps {
  value: string;
  selectedLabel?: string;
  onValueChange: (id: string, option: SearchDropdownOption) => void;
  apiPath: string;
  queryParams?: Record<string, string>;
  labelKey?: string;
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
  appendOptions = [],
  placeholder = 'Select…',
  disabled,
  className = '',
}: SearchDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [options, setOptions] = React.useState<SearchDropdownOption[]>([]);
  const [loading, setLoading] = React.useState(false);
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
      const records = (data.records ?? []).map((r: Record<string, unknown>) => ({
        id: String(r.id),
        name: (r[labelKey] as string) ?? (r.name as string) ?? '',
      }));
      if (append) {
        setOptions((prev) => (skip === 0 ? records : [...prev, ...records]));
      } else {
        setOptions(records);
      }
    },
    [apiPath, debouncedSearch, queryParams, labelKey],
  );

  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchPage(0, false).finally(() => setLoading(false));
  }, [open, debouncedSearch, fetchPage]);

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
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className={styles.searchDropdownTrigger}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={!displayLabel ? styles.searchDropdownPlaceholder : ''}>{displayLabel || placeholder}</span>
        <span aria-hidden style={{ marginLeft: 'auto', fontSize: '10px' }}>
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
          <div className="max-h-[260px] overflow-y-auto">
            {loading ? (
              <div className="px-4 py-3 text-sm text-[var(--sim-light)]">Laden…</div>
            ) : (
              <>
                {allOptions.length === 0 && !loading && <div className="px-4 py-3 text-sm text-[var(--sim-light)]">Geen resultaten.</div>}
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
