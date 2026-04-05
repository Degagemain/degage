'use client';

import { Field, FieldDescription, FieldLabel } from '@/app/components/ui/field';
import { Switch } from '@/app/components/ui/switch';

interface SwitchFieldControlProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  description?: string;
}

export function SwitchFieldControl({ id, label, checked, onChange, disabled, description }: SwitchFieldControlProps) {
  return (
    <Field orientation="horizontal" className="max-w-xl">
      <Switch id={id} checked={checked} onCheckedChange={(value) => onChange(value === true)} disabled={disabled} />
      <div className="space-y-0.5">
        <FieldLabel htmlFor={id} className="cursor-pointer font-normal">
          {label}
        </FieldLabel>
        {description ? <FieldDescription>{description}</FieldDescription> : null}
      </div>
    </Field>
  );
}
