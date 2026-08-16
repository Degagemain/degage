'use client';

import { SearchableSelect, type SearchableSelectProps } from '@/app/components/ui/searchable-select';

import styles from '../car-onboarding-public.module.css';
import { PublicField } from './public-ui';

type PublicSearchableFieldProps = SearchableSelectProps & {
  label: string;
  hint?: string;
};

export function PublicSearchableField({ label, hint, ...selectProps }: PublicSearchableFieldProps) {
  return (
    <PublicField label={label} hint={hint}>
      <SearchableSelect {...selectProps} unstyledTrigger triggerClassName={styles.searchableTrigger} />
    </PublicField>
  );
}
