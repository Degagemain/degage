'use client';

import { SearchableSelect, type SearchableSelectProps } from '@/app/components/ui/searchable-select';

import { PublicField } from './public-ui';

type PublicSearchableFieldProps = SearchableSelectProps & {
  label: string;
  hint?: string;
};

export function PublicSearchableField({ label, hint, ...selectProps }: PublicSearchableFieldProps) {
  return (
    <PublicField label={label} hint={hint}>
      <SearchableSelect {...selectProps} triggerClassName="w-full" />
    </PublicField>
  );
}
