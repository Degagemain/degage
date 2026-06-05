'use client';

import { useCallback, useRef, useState } from 'react';
import { CircleCheck, CircleX, Loader2, Minus } from 'lucide-react';

import { Town, townSchema } from '@/domain/town.model';
import { apiPut } from '@/app/lib/api-client';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Field, FieldContent, FieldLabel } from '@/app/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { type SearchableOption, SearchableSelect } from '@/app/components/ui/searchable-select';

export interface BulkUpdateTownItem {
  id: string;
  label: string;
  town: Town;
}

type ItemStatus = 'pending' | 'updating' | 'success' | 'error';
type BooleanUpdate = 'unset' | 'true' | 'false';
type HubUpdate = 'unset' | 'replace';

interface ItemResult {
  status: ItemStatus;
  error?: string;
}

export interface BulkUpdateTownLabels {
  title: string;
  description: string;
  hubLabel: string;
  hubPlaceholder: string;
  highDemandLabel: string;
  hasActiveMembersLabel: string;
  unsetOption: string;
  replaceOption: string;
  yesOption: string;
  noOption: string;
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

interface BulkUpdateTownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: BulkUpdateTownItem[];
  onComplete: () => void;
  labels: BulkUpdateTownLabels;
}

function StatusCell({ result, labels }: { result: ItemResult; labels: BulkUpdateTownLabels }) {
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
  labels: BulkUpdateTownLabels;
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

export function BulkUpdateTownDialog({ open, onOpenChange, items, onComplete, labels }: BulkUpdateTownDialogProps) {
  const [hubMode, setHubMode] = useState<HubUpdate>('unset');
  const [selectedHub, setSelectedHub] = useState<SearchableOption | null>(null);
  const [highDemand, setHighDemand] = useState<BooleanUpdate>('unset');
  const [hasActiveMembers, setHasActiveMembers] = useState<BooleanUpdate>('unset');
  const [results, setResults] = useState<Record<string, ItemResult>>({});
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef(false);

  const isDone = !isRunning && Object.keys(results).length > 0;
  const hasSelectedUpdates = hubMode !== 'unset' || highDemand !== 'unset' || hasActiveMembers !== 'unset';
  const canConfirm = hasSelectedUpdates && (hubMode !== 'replace' || selectedHub !== null);

  const handleConfirm = useCallback(async () => {
    if (!canConfirm) return;

    setIsRunning(true);
    abortRef.current = false;

    for (const item of items) {
      if (abortRef.current) break;

      setResults((prev) => ({ ...prev, [item.id]: { status: 'updating' } }));

      try {
        const updatedTown = townSchema.parse({
          id: item.town.id,
          zip: item.town.zip,
          name: item.town.name,
          municipality: item.town.municipality,
          province: item.town.province,
          hub: hubMode === 'unset' || !selectedHub ? item.town.hub : { id: selectedHub.id, name: selectedHub.name },
          highDemand: highDemand === 'unset' ? item.town.highDemand : highDemand === 'true',
          hasActiveMembers: hasActiveMembers === 'unset' ? item.town.hasActiveMembers : hasActiveMembers === 'true',
          createdAt: item.town.createdAt,
          updatedAt: item.town.updatedAt,
        });
        const response = await apiPut(`/api/towns/${item.id}`, updatedTown);

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
  }, [canConfirm, hasActiveMembers, highDemand, hubMode, items, labels.statusError, selectedHub]);

  const handleClose = useCallback(() => {
    abortRef.current = true;
    const hadResults = Object.keys(results).length > 0;
    setHubMode('unset');
    setSelectedHub(null);
    setHighDemand('unset');
    setHasActiveMembers('unset');
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
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription>{labels.description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <Field>
              <FieldLabel>{labels.hubLabel}</FieldLabel>
              <FieldContent>
                <Select value={hubMode} onValueChange={(next) => setHubMode(next as HubUpdate)} disabled={isRunning || isDone}>
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
            {hubMode === 'replace' ? (
              <SearchableSelect
                value={selectedHub?.id ?? ''}
                selectedLabel={selectedHub?.name}
                onValueChange={(_id, option) => setSelectedHub(option)}
                apiPath="hubs"
                placeholder={labels.hubPlaceholder}
                disabled={isRunning || isDone}
              />
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <BooleanUpdateField
              label={labels.highDemandLabel}
              value={highDemand}
              onChange={setHighDemand}
              labels={labels}
              disabled={isRunning || isDone}
            />
            <BooleanUpdateField
              label={labels.hasActiveMembersLabel}
              value={hasActiveMembers}
              onChange={setHasActiveMembers}
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
