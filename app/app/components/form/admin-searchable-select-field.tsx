'use client';

import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/app/components/ui/field';
import { SearchableSelect, type SearchableSelectProps } from '@/app/components/ui/searchable-select';

type AdminSearchableSelectFieldProps = SearchableSelectProps & {
  label: string;
  description?: string;
  error?: string;
};

export function AdminSearchableSelectField({ label, description, error, className, ...selectProps }: AdminSearchableSelectFieldProps) {
  return (
    <Field data-invalid={Boolean(error)} className={className ?? 'max-w-xl'}>
      <FieldLabel>{label}</FieldLabel>
      <FieldContent>
        <SearchableSelect {...selectProps} />
        {description ? <FieldDescription>{description}</FieldDescription> : null}
        <FieldError>{error}</FieldError>
      </FieldContent>
    </Field>
  );
}
