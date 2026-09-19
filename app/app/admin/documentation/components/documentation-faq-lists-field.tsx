'use client';

import { useTranslations } from 'next-intl';

import { type DocumentationTag, documentationTagValues } from '@/domain/documentation.model';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Field, FieldLabel } from '@/app/components/ui/field';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';

interface DocumentationFaqListsFieldProps {
  values: DocumentationTag[];
  onValuesChange: (values: DocumentationTag[]) => void;
  disabled?: boolean;
}

export function DocumentationFaqListsField({ values, onValuesChange, disabled }: DocumentationFaqListsFieldProps) {
  const tForm = useTranslations('admin.documentation.form');
  const tFaqLists = useTranslations('admin.documentation.faqLists');
  const selected = new Set(values);

  const toggle = (tag: DocumentationTag) => {
    if (disabled) return;
    if (selected.has(tag)) {
      onValuesChange(values.filter((value) => value !== tag));
    } else {
      onValuesChange([...values, tag]);
    }
  };

  return (
    <Field className="max-w-3xl">
      <FieldLabel>{tForm('tags')}</FieldLabel>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>{tFaqLists('code')}</TableHead>
              <TableHead>{tFaqLists('description')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documentationTagValues.map((tag) => {
              const checked = selected.has(tag);
              return (
                <TableRow
                  key={tag}
                  className={disabled ? undefined : 'cursor-pointer'}
                  data-state={checked ? 'selected' : undefined}
                  onClick={() => toggle(tag)}
                >
                  <TableCell>
                    <Checkbox
                      checked={checked}
                      disabled={disabled}
                      aria-label={tag}
                      onCheckedChange={() => toggle(tag)}
                      onClick={(event) => event.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{tag}</TableCell>
                  <TableCell className="text-muted-foreground whitespace-normal">{tFaqLists(tag)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Field>
  );
}
