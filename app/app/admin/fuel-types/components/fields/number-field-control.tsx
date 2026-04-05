'use client';

import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/app/components/ui/field';
import { Input } from '@/app/components/ui/input';

interface NumberFieldControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  min?: number;
  step?: number;
  description?: string;
  error?: string;
}

export function NumberFieldControl({ label, value, onChange, disabled, min, step, description, error }: NumberFieldControlProps) {
  return (
    <Field data-invalid={Boolean(error)} className="max-w-xl">
      <FieldLabel>{label}</FieldLabel>
      <FieldContent>
        <Input
          type="number"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          min={min}
          step={step}
          aria-invalid={Boolean(error)}
          disabled={disabled}
        />
        {description ? <FieldDescription>{description}</FieldDescription> : null}
        <FieldError>{error}</FieldError>
      </FieldContent>
    </Field>
  );
}
