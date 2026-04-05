'use client';

import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/app/components/ui/field';
import { Input } from '@/app/components/ui/input';

interface AdminDateFieldControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  description?: string;
  error?: string;
}

export function AdminDateFieldControl({ label, value, onChange, disabled, description, error }: AdminDateFieldControlProps) {
  return (
    <Field data-invalid={Boolean(error)} className="max-w-xl">
      <FieldLabel>{label}</FieldLabel>
      <FieldContent>
        <Input type="date" value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} disabled={disabled} />
        {description ? <FieldDescription>{description}</FieldDescription> : null}
        <FieldError>{error}</FieldError>
      </FieldContent>
    </Field>
  );
}
