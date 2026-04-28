'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Check, ChevronDown } from 'lucide-react';

import { cn } from '@/app/lib/utils';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/app/components/ui/command';
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/app/components/ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { Skeleton } from '@/app/components/ui/skeleton';

export type AdminMultiSelectOption = { value: string; label: string };

interface AdminMultiSelectFieldControlProps {
  label: string;
  options: AdminMultiSelectOption[];
  values: string[];
  onValuesChange: (values: string[]) => void;
  placeholder: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  description?: string;
  emptyText?: string;
  loading?: boolean;
  /** Use monospace for option labels (e.g. tags). */
  monospaceOptions?: boolean;
}

export function AdminMultiSelectFieldControl({
  label,
  options,
  values,
  onValuesChange,
  placeholder,
  searchPlaceholder,
  disabled,
  description,
  emptyText,
  loading,
  monospaceOptions,
}: AdminMultiSelectFieldControlProps) {
  const tToolbar = useTranslations('dataTable.toolbar');
  const tFaceted = useTranslations('dataTable.facetedFilter');
  const [open, setOpen] = React.useState(false);
  const triggerId = React.useId();

  const selectedSet = React.useMemo(() => new Set(values), [values]);
  const labelByValue = React.useMemo(() => new Map(options.map((o) => [o.value, o.label])), [options]);

  const toggle = (value: string) => {
    const next = new Set(values);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onValuesChange(Array.from(next));
  };

  const selectedLabels = values.map((v) => labelByValue.get(v) ?? v);

  const searchPh = searchPlaceholder ?? tToolbar('searchPlaceholder');
  const emptyPh = emptyText ?? tFaceted('noResults');

  return (
    <Field className="max-w-xl">
      <FieldLabel htmlFor={triggerId}>{label}</FieldLabel>
      <FieldContent>
        <Popover open={open} onOpenChange={setOpen} modal={false}>
          <PopoverTrigger asChild>
            <Button
              id={triggerId}
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="h-auto min-h-9 w-full justify-between gap-2 py-1.5 pr-2 pl-3 font-normal"
              disabled={disabled || loading}
            >
              <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1 text-left">
                {loading ? (
                  <Skeleton className="h-5 w-32" />
                ) : values.length === 0 ? (
                  <span className="text-muted-foreground">{placeholder}</span>
                ) : values.length <= 2 ? (
                  selectedLabels.map((text) => (
                    <Badge key={text} variant="secondary" className="font-normal">
                      {text}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary" className="font-normal">
                    {tFaceted('selected', { count: values.length })}
                  </Badge>
                )}
              </span>
              <ChevronDown className="size-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-w-xl p-0" align="start">
            <Command shouldFilter>
              <CommandInput placeholder={searchPh} />
              <CommandList className="max-h-[280px]">
                <CommandEmpty>{emptyPh}</CommandEmpty>
                <CommandGroup>
                  {options.map((opt) => {
                    const isSelected = selectedSet.has(opt.value);
                    return (
                      <CommandItem
                        key={opt.value}
                        value={`${opt.label} ${opt.value}`}
                        onSelect={() => toggle(opt.value)}
                        className="cursor-pointer"
                      >
                        <Check className={cn('mr-2 size-4 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')} />
                        <span className={cn(monospaceOptions && 'font-mono text-xs')}>{opt.label}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {description ? <FieldDescription>{description}</FieldDescription> : null}
      </FieldContent>
    </Field>
  );
}
