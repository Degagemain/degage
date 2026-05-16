'use client';

import { useCallback, useRef, useState } from 'react';
import { CircleCheck, CircleX, Loader2, Minus } from 'lucide-react';

import { Town } from '@/domain/town.model';
import { apiPut } from '@/app/lib/api-client';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { type SearchableOption, SearchableSelect } from '@/app/components/ui/searchable-select';

export interface BulkMoveHubItem {
  id: string;
  label: string;
  town: Town;
}

type ItemStatus = 'pending' | 'moving' | 'success' | 'error';

interface ItemResult {
  status: ItemStatus;
  error?: string;
}

export interface BulkMoveHubLabels {
  title: string;
  description: string;
  hubLabel: string;
  hubPlaceholder: string;
  columnName: string;
  columnStatus: string;
  confirm: string;
  cancel: string;
  close: string;
  statusPending: string;
  statusMoving: string;
  statusSuccess: string;
  statusError: string;
}

interface BulkMoveHubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: BulkMoveHubItem[];
  onComplete: () => void;
  labels: BulkMoveHubLabels;
}

function StatusCell({ result, labels }: { result: ItemResult; labels: BulkMoveHubLabels }) {
  switch (result.status) {
    case 'pending':
      return (
        <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <Minus className="size-4" />
          {labels.statusPending}
        </span>
      );
    case 'moving':
      return (
        <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <Loader2 className="size-4 animate-spin" />
          {labels.statusMoving}
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

export function BulkMoveHubDialog({ open, onOpenChange, items, onComplete, labels }: BulkMoveHubDialogProps) {
  const [selectedHub, setSelectedHub] = useState<SearchableOption | null>(null);
  const [results, setResults] = useState<Record<string, ItemResult>>({});
  const [isRunning, setIsRunning] = useState(false);
  const isDone = !isRunning && Object.keys(results).length > 0;
  const abortRef = useRef(false);

  const handleConfirm = useCallback(async () => {
    if (!selectedHub) return;

    setIsRunning(true);
    abortRef.current = false;

    for (const item of items) {
      if (abortRef.current) break;

      setResults((prev) => ({ ...prev, [item.id]: { status: 'moving' } }));

      try {
        const updatedTown: Town = {
          id: item.town.id,
          zip: item.town.zip,
          name: item.town.name,
          municipality: item.town.municipality,
          province: item.town.province,
          hub: { id: selectedHub.id, name: selectedHub.name },
          highDemand: item.town.highDemand,
          hasActiveMembers: item.town.hasActiveMembers,
          createdAt: item.town.createdAt,
          updatedAt: item.town.updatedAt,
        };
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
  }, [items, selectedHub, labels.statusError]);

  const handleClose = useCallback(() => {
    abortRef.current = true;
    const hadResults = Object.keys(results).length > 0;
    setResults({});
    setSelectedHub(null);
    setIsRunning(false);
    onOpenChange(false);
    if (hadResults) onComplete();
  }, [results, onOpenChange, onComplete]);

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

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">{labels.hubLabel}</span>
            <SearchableSelect
              value={selectedHub?.id ?? ''}
              selectedLabel={selectedHub?.name}
              onValueChange={(id, option) => setSelectedHub(option)}
              apiPath="hubs"
              placeholder={labels.hubPlaceholder}
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
              <Button onClick={handleConfirm} disabled={isRunning || !selectedHub}>
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
