'use client';

import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/app/components/ui/field';
import { Input } from '@/app/components/ui/input';

interface AdminTextFieldControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  description?: string;
  error?: string;
}

export function AdminTextFieldControl({ label, value, onChange, disabled, placeholder, description, error }: AdminTextFieldControlProps) {
  return (
    <Field data-invalid={Boolean(error)} className="max-w-xl">
      <FieldLabel>{label}</FieldLabel>
      <FieldContent>
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          disabled={disabled}
        />
        {description ? <FieldDescription>{description}</FieldDescription> : null}
        <FieldError>{error}</FieldError>
      </FieldContent>
    </Field>
  );
}
