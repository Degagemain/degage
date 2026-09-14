'use client';

import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/app/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

export type AdminSelectOption = { value: string; label: string };

interface AdminSelectFieldControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: AdminSelectOption[];
  disabled?: boolean;
  placeholder?: string;
  description?: string;
  error?: string;
}

export function AdminSelectFieldControl({
  label,
  value,
  onChange,
  options,
  disabled,
  placeholder,
  description,
  error,
}: AdminSelectFieldControlProps) {
  return (
    <Field data-invalid={Boolean(error)} className="max-w-xl">
      <FieldLabel>{label}</FieldLabel>
      <FieldContent>
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger className="w-full" aria-invalid={Boolean(error)}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {description ? <FieldDescription>{description}</FieldDescription> : null}
        <FieldError>{error}</FieldError>
      </FieldContent>
    </Field>
  );
}
