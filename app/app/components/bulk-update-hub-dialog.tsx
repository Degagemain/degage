'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { CircleCheck, CircleX, Loader2, Minus } from 'lucide-react';

import { Hub, hubSchema } from '@/domain/hub.model';
import { apiPut } from '@/app/lib/api-client';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Field, FieldContent, FieldLabel } from '@/app/components/ui/field';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';

export interface BulkUpdateHubItem {
  id: string;
  label: string;
  hub: Hub;
}

type ItemStatus = 'pending' | 'updating' | 'success' | 'error';
type FieldMode = 'unset' | 'set' | 'clear';

interface ItemResult {
  status: ItemStatus;
  error?: string;
}

interface FieldConfig {
  key: keyof Hub;
  integer: boolean;
  step: number;
  nullable?: boolean;
}

export const HUB_BULK_NUMERIC_FIELDS = [
  { key: 'simMaxAge', integer: true, step: 1 },
  { key: 'simMaxKm', integer: true, step: 1 },
  { key: 'simMinEuroNormGroupDiesel', integer: true, step: 1 },
  { key: 'simMinEcoScoreForBonus', integer: true, step: 1 },
  { key: 'simMaxKmForBonus', integer: true, step: 1 },
  { key: 'simMaxAgeForBonus', integer: true, step: 1 },
  { key: 'simDepreciationKm', integer: true, step: 1 },
  { key: 'simDepreciationKmElectric', integer: true, step: 1 },
  { key: 'simInspectionCostPerYear', integer: false, step: 0.01 },
  { key: 'simMaintenanceCostPerYear', integer: false, step: 0.01 },
  { key: 'minSharedKm', integer: true, step: 1 },
  { key: 'avgSharedKm', integer: true, step: 1 },
  { key: 'maxSharedKm', integer: true, step: 1 },
  { key: 'simMaxPrice', integer: true, step: 1, nullable: true },
  { key: 'simAcceptedPriceCategoryA', integer: false, step: 0.01 },
  { key: 'simAcceptedPriceCategoryB', integer: false, step: 0.01 },
  { key: 'simAcceptedDepreciationCostKm', integer: false, step: 0.01 },
  { key: 'simAcceptedElectricDepreciationCostKm', integer: false, step: 0.01 },
  { key: 'simMinDepreciationCostKm', integer: false, step: 0.01 },
] as const satisfies readonly FieldConfig[];

type HubBulkNumericFieldKey = (typeof HUB_BULK_NUMERIC_FIELDS)[number]['key'];

type FieldState = Record<HubBulkNumericFieldKey, { mode: FieldMode; value: string }>;

const createInitialFieldState = (): FieldState =>
  Object.fromEntries(HUB_BULK_NUMERIC_FIELDS.map((field) => [field.key, { mode: 'unset', value: '' }])) as FieldState;

const isValidSetValue = (field: (typeof HUB_BULK_NUMERIC_FIELDS)[number], value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const num = Number(trimmed);
  if (field.key === 'simMaxPrice') {
    return Number.isInteger(num) && num > 0;
  }
  if (field.integer) {
    return Number.isInteger(num) && num >= 0;
  }
  return Number.isFinite(num) && num >= 0;
};

const applyFieldUpdates = (hub: Hub, fields: FieldState): Hub => {
  const updated = { ...hub };
  for (const field of HUB_BULK_NUMERIC_FIELDS) {
    const state = fields[field.key];
    if (state.mode === 'unset') continue;
    if (field.key === 'simMaxPrice' && state.mode === 'clear') {
      updated.simMaxPrice = null;
      continue;
    }
    if (state.mode === 'set') {
      (updated as Record<string, unknown>)[field.key] = Number(state.value);
    }
  }
  return updated;
};

export interface BulkUpdateHubLabels {
  title: string;
  description: string;
  unsetOption: string;
  setOption: string;
  clearOption: string;
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

interface BulkUpdateHubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: BulkUpdateHubItem[];
  fieldLabels: Record<HubBulkNumericFieldKey, string>;
  onComplete: () => void;
  labels: BulkUpdateHubLabels;
}

function StatusCell({ result, labels }: { result: ItemResult; labels: BulkUpdateHubLabels }) {
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

function OptionalNumericField({
  field,
  label,
  state,
  onChange,
  labels,
  disabled,
}: {
  field: (typeof HUB_BULK_NUMERIC_FIELDS)[number];
  label: string;
  state: { mode: FieldMode; value: string };
  onChange: (next: { mode: FieldMode; value: string }) => void;
  labels: BulkUpdateHubLabels;
  disabled: boolean;
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <FieldContent className="space-y-2">
        <Select
          value={state.mode}
          onValueChange={(next) => onChange({ mode: next as FieldMode, value: next === 'set' ? state.value : '' })}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unset">{labels.unsetOption}</SelectItem>
            <SelectItem value="set">{labels.setOption}</SelectItem>
            {field.key === 'simMaxPrice' ? <SelectItem value="clear">{labels.clearOption}</SelectItem> : null}
          </SelectContent>
        </Select>
        {state.mode === 'set' ? (
          <Input
            type="number"
            value={state.value}
            onChange={(event) => onChange({ ...state, value: event.target.value })}
            min={field.key === 'simMaxPrice' ? 1 : 0}
            step={field.step}
            disabled={disabled}
          />
        ) : null}
      </FieldContent>
    </Field>
  );
}

export function BulkUpdateHubDialog({ open, onOpenChange, items, fieldLabels, onComplete, labels }: BulkUpdateHubDialogProps) {
  const [fields, setFields] = useState<FieldState>(createInitialFieldState);
  const [results, setResults] = useState<Record<string, ItemResult>>({});
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef(false);

  const isDone = !isRunning && Object.keys(results).length > 0;

  const hasSelectedUpdates = useMemo(() => HUB_BULK_NUMERIC_FIELDS.some((field) => fields[field.key].mode !== 'unset'), [fields]);

  const canConfirm = useMemo(() => {
    if (!hasSelectedUpdates) return false;
    return HUB_BULK_NUMERIC_FIELDS.every((field) => {
      const state = fields[field.key];
      if (state.mode === 'unset' || state.mode === 'clear') return true;
      return isValidSetValue(field, state.value);
    });
  }, [fields, hasSelectedUpdates]);

  const handleFieldChange = useCallback((key: HubBulkNumericFieldKey, next: { mode: FieldMode; value: string }) => {
    setFields((prev) => ({ ...prev, [key]: next }));
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!canConfirm) return;

    setIsRunning(true);
    abortRef.current = false;

    for (const item of items) {
      if (abortRef.current) break;

      setResults((prev) => ({ ...prev, [item.id]: { status: 'updating' } }));

      try {
        const updatedHub = hubSchema.parse(applyFieldUpdates(item.hub, fields));
        const response = await apiPut(`/api/hubs/${item.id}`, updatedHub);

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
  }, [canConfirm, fields, items, labels.statusError]);

  const handleClose = useCallback(() => {
    abortRef.current = true;
    const hadResults = Object.keys(results).length > 0;
    setFields(createInitialFieldState());
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
      <DialogContent showCloseButton={false} className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription>{labels.description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="max-h-64 overflow-y-auto rounded-md border p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {HUB_BULK_NUMERIC_FIELDS.map((field) => (
                <OptionalNumericField
                  key={field.key}
                  field={field}
                  label={fieldLabels[field.key]}
                  state={fields[field.key]}
                  onChange={(next) => handleFieldChange(field.key, next)}
                  labels={labels}
                  disabled={isRunning || isDone}
                />
              ))}
            </div>
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
              <Button onClick={handleConfirm} disabled={isRunning || !canConfirm || items.length === 0}>
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
