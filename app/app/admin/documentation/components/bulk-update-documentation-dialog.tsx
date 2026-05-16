'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { CircleCheck, CircleX, Loader2, Minus } from 'lucide-react';

import { type Documentation, type DocumentationAudienceRole, type DocumentationTag, documentationSchema } from '@/domain/documentation.model';
import { apiPut } from '@/app/lib/api-client';
import { AdminMultiSelectFieldControl, type AdminMultiSelectOption } from '@/app/components/form/admin-multi-select-field-control';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Field, FieldContent, FieldLabel } from '@/app/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';

export interface BulkUpdateDocumentationItem {
  id: string;
  label: string;
  documentation: Documentation;
}

type ItemStatus = 'pending' | 'updating' | 'success' | 'error';
type BooleanUpdate = 'unset' | 'true' | 'false';
type MultiUpdate = 'unset' | 'replace';

interface ItemResult {
  status: ItemStatus;
  error?: string;
}

export interface BulkUpdateDocumentationLabels {
  title: string;
  description: string;
  isFaqLabel: string;
  isPublicLabel: string;
  tagsLabel: string;
  rolesLabel: string;
  groupsLabel: string;
  unsetOption: string;
  yesOption: string;
  noOption: string;
  replaceOption: string;
  tagsPlaceholder: string;
  rolesPlaceholder: string;
  groupsPlaceholder: string;
  columnName: string;
  columnStatus: string;
  confirm: string;
  cancel: string;
  close: string;
  statusPending: string;
  statusUpdating: string;
  statusSuccess: string;
  statusError: string;
}

interface BulkUpdateDocumentationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: BulkUpdateDocumentationItem[];
  groupOptions: AdminMultiSelectOption[];
  roleOptions: AdminMultiSelectOption[];
  tagOptions: AdminMultiSelectOption[];
  onComplete: () => void;
  labels: BulkUpdateDocumentationLabels;
}

function StatusCell({ result, labels }: { result: ItemResult; labels: BulkUpdateDocumentationLabels }) {
  switch (result.status) {
    case 'pending':
      return (
        <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <Minus className="size-4" />
          {labels.statusPending}
        </span>
      );
    case 'updating':
      return (
        <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <Loader2 className="size-4 animate-spin" />
          {labels.statusUpdating}
        </span>
      );
    case 'success':
      return (
        <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
          <CircleCheck className="size-4" />
          {labels.statusSuccess}
        </span>
      );
    case 'error':
      return (
        <span className="text-destructive flex items-center gap-1.5 text-sm">
          <CircleX className="size-4" />
          {result.error}
        </span>
      );
  }
}

function BooleanUpdateField({
  label,
  value,
  onChange,
  labels,
  disabled,
}: {
  label: string;
  value: BooleanUpdate;
  onChange: (value: BooleanUpdate) => void;
  labels: BulkUpdateDocumentationLabels;
  disabled: boolean;
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <FieldContent>
        <Select value={value} onValueChange={(next) => onChange(next as BooleanUpdate)} disabled={disabled}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unset">{labels.unsetOption}</SelectItem>
            <SelectItem value="true">{labels.yesOption}</SelectItem>
            <SelectItem value="false">{labels.noOption}</SelectItem>
          </SelectContent>
        </Select>
      </FieldContent>
    </Field>
  );
}

function MultiUpdateField({
  label,
  mode,
  values,
  options,
  placeholder,
  onModeChange,
  onValuesChange,
  labels,
  disabled,
  monospaceOptions,
}: {
  label: string;
  mode: MultiUpdate;
  values: string[];
  options: AdminMultiSelectOption[];
  placeholder: string;
  onModeChange: (value: MultiUpdate) => void;
  onValuesChange: (values: string[]) => void;
  labels: BulkUpdateDocumentationLabels;
  disabled: boolean;
  monospaceOptions?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Field>
        <FieldLabel>{label}</FieldLabel>
        <FieldContent>
          <Select value={mode} onValueChange={(next) => onModeChange(next as MultiUpdate)} disabled={disabled}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unset">{labels.unsetOption}</SelectItem>
              <SelectItem value="replace">{labels.replaceOption}</SelectItem>
            </SelectContent>
          </Select>
        </FieldContent>
      </Field>
      {mode === 'replace' ? (
        <AdminMultiSelectFieldControl
          label={label}
          options={options}
          values={values}
          onValuesChange={onValuesChange}
          placeholder={placeholder}
          disabled={disabled}
          monospaceOptions={monospaceOptions}
        />
      ) : null}
    </div>
  );
}

export function BulkUpdateDocumentationDialog({
  open,
  onOpenChange,
  items,
  groupOptions,
  roleOptions,
  tagOptions,
  onComplete,
  labels,
}: BulkUpdateDocumentationDialogProps) {
  const [isFaq, setIsFaq] = useState<BooleanUpdate>('unset');
  const [isPublic, setIsPublic] = useState<BooleanUpdate>('unset');
  const [tagsMode, setTagsMode] = useState<MultiUpdate>('unset');
  const [rolesMode, setRolesMode] = useState<MultiUpdate>('unset');
  const [groupsMode, setGroupsMode] = useState<MultiUpdate>('unset');
  const [tags, setTags] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [results, setResults] = useState<Record<string, ItemResult>>({});
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef(false);

  const isDone = !isRunning && Object.keys(results).length > 0;
  const hasSelectedUpdates =
    isFaq !== 'unset' || isPublic !== 'unset' || tagsMode !== 'unset' || rolesMode !== 'unset' || groupsMode !== 'unset';

  const groupLabelById = useMemo(() => new Map(groupOptions.map((option) => [option.value, option.label])), [groupOptions]);

  const handleConfirm = useCallback(async () => {
    if (!hasSelectedUpdates) return;

    setIsRunning(true);
    abortRef.current = false;

    for (const item of items) {
      if (abortRef.current) break;

      setResults((prev) => ({ ...prev, [item.id]: { status: 'updating' } }));

      try {
        const updated = documentationSchema.parse({
          ...item.documentation,
          ...(isFaq === 'unset' ? {} : { isFaq: isFaq === 'true' }),
          ...(isPublic === 'unset' ? {} : { isPublic: isPublic === 'true' }),
          ...(tagsMode === 'unset' ? {} : { tags: tags as DocumentationTag[] }),
          ...(rolesMode === 'unset' ? {} : { audienceRoles: roles as DocumentationAudienceRole[] }),
          ...(groupsMode === 'unset'
            ? {}
            : {
                groups: groups.map((id) => ({
                  id,
                  name: groupLabelById.get(id) ?? id,
                })),
              }),
        });
        const response = await apiPut(`/api/documentation/${item.id}`, updated);

        if (response.ok) {
          setResults((prev) => ({ ...prev, [item.id]: { status: 'success' } }));
        } else {
          setResults((prev) => ({ ...prev, [item.id]: { status: 'error', error: labels.statusError } }));
        }
      } catch {
        setResults((prev) => ({ ...prev, [item.id]: { status: 'error', error: labels.statusError } }));
      }
    }

    setIsRunning(false);
  }, [groupLabelById, groups, groupsMode, hasSelectedUpdates, isFaq, isPublic, items, labels.statusError, roles, rolesMode, tags, tagsMode]);

  const handleClose = useCallback(() => {
    abortRef.current = true;
    const hadResults = Object.keys(results).length > 0;
    setIsFaq('unset');
    setIsPublic('unset');
    setTagsMode('unset');
    setRolesMode('unset');
    setGroupsMode('unset');
    setTags([]);
    setRoles([]);
    setGroups([]);
    setResults({});
    setIsRunning(false);
    onOpenChange(false);
    if (hadResults) onComplete();
  }, [onComplete, onOpenChange, results]);

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value && !isRunning) handleClose();
      }}
    >
      <DialogContent showCloseButton={false} className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription>{labels.description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <BooleanUpdateField label={labels.isFaqLabel} value={isFaq} onChange={setIsFaq} labels={labels} disabled={isRunning || isDone} />
            <BooleanUpdateField
              label={labels.isPublicLabel}
              value={isPublic}
              onChange={setIsPublic}
              labels={labels}
              disabled={isRunning || isDone}
            />
          </div>

          <div className="grid gap-4">
            <MultiUpdateField
              label={labels.tagsLabel}
              mode={tagsMode}
              values={tags}
              options={tagOptions}
              placeholder={labels.tagsPlaceholder}
              onModeChange={setTagsMode}
              onValuesChange={setTags}
              labels={labels}
              disabled={isRunning || isDone}
              monospaceOptions
            />
            <MultiUpdateField
              label={labels.rolesLabel}
              mode={rolesMode}
              values={roles}
              options={roleOptions}
              placeholder={labels.rolesPlaceholder}
              onModeChange={setRolesMode}
              onValuesChange={setRoles}
              labels={labels}
              disabled={isRunning || isDone}
            />
            <MultiUpdateField
              label={labels.groupsLabel}
              mode={groupsMode}
              values={groups}
              options={groupOptions}
              placeholder={labels.groupsPlaceholder}
              onModeChange={setGroupsMode}
              onValuesChange={setGroups}
              labels={labels}
              disabled={isRunning || isDone}
            />
          </div>

          <div className="max-h-64 overflow-y-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>{labels.columnName}</TableHead>
                  <TableHead>{labels.columnStatus}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.label}</TableCell>
                    <TableCell>
                      <StatusCell result={results[item.id] ?? { status: 'pending' }} labels={labels} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          {isDone ? (
            <Button variant="outline" onClick={handleClose}>
              {labels.close}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isRunning}>
                {labels.cancel}
              </Button>
              <Button onClick={handleConfirm} disabled={isRunning || !hasSelectedUpdates || items.length === 0}>
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {labels.confirm}
                  </>
                ) : (
                  labels.confirm
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
