'use client';

import { useCallback, useRef, useState } from 'react';
import { CircleCheck, CircleX, Loader2, Minus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Button } from '@/app/components/ui/button';

export interface BulkDeleteItem {
  id: string;
  label: string;
}

type ItemStatus = 'pending' | 'deleting' | 'success' | 'error';

interface ItemResult {
  status: ItemStatus;
  error?: string;
}

export interface BulkDeleteLabels {
  title: string;
  description: string;
  columnName: string;
  columnStatus: string;
  confirm: string;
  cancel: string;
  close: string;
  statusPending: string;
  statusDeleting: string;
  statusSuccess: string;
  statusError: string;
  statusConflict: string;
}

interface BulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: BulkDeleteItem[];
  deleteItem: (id: string) => Promise<Response>;
  onComplete: () => void;
  labels: BulkDeleteLabels;
}

function StatusCell({ result, labels }: { result: ItemResult; labels: BulkDeleteLabels }) {
  switch (result.status) {
    case 'pending':
      return (
        <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <Minus className="size-4" />
          {labels.statusPending}
        </span>
      );
    case 'deleting':
      return (
        <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <Loader2 className="size-4 animate-spin" />
          {labels.statusDeleting}
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

export function BulkDeleteDialog({ open, onOpenChange, items, deleteItem, onComplete, labels }: BulkDeleteDialogProps) {
  const [results, setResults] = useState<Record<string, ItemResult>>({});
  const [isRunning, setIsRunning] = useState(false);
  const isDone = !isRunning && Object.keys(results).length > 0;
  const abortRef = useRef(false);

  const handleConfirm = useCallback(async () => {
    setIsRunning(true);
    abortRef.current = false;

    for (const item of items) {
      if (abortRef.current) break;

      setResults((prev) => ({ ...prev, [item.id]: { status: 'deleting' } }));

      try {
        const response = await deleteItem(item.id);

        if (response.ok) {
          setResults((prev) => ({ ...prev, [item.id]: { status: 'success' } }));
        } else if (response.status === 409) {
          setResults((prev) => ({ ...prev, [item.id]: { status: 'error', error: labels.statusConflict } }));
        } else {
          setResults((prev) => ({ ...prev, [item.id]: { status: 'error', error: labels.statusError } }));
        }
      } catch {
        setResults((prev) => ({ ...prev, [item.id]: { status: 'error', error: labels.statusError } }));
      }
    }

    setIsRunning(false);
  }, [items, deleteItem, labels]);

  const handleClose = useCallback(() => {
    abortRef.current = true;
    const hadResults = Object.keys(results).length > 0;
    setResults({});
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
              <Button variant="destructive" onClick={handleConfirm} disabled={isRunning}>
                {isRunning ? labels.confirm + '...' : labels.confirm}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
