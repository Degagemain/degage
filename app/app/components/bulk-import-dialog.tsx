'use client';

import { ChangeEvent, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CircleCheck, CircleX, Loader2, Minus, Upload } from 'lucide-react';

import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { runWithConcurrency } from '@/app/lib/run-with-concurrency';

type ItemStatus = 'pending' | 'running' | 'success' | 'error';

interface ItemResult {
  status: ItemStatus;
  error?: string;
}

/** Per-entity strings supplied by the caller. Everything else is read from `admin.common.import`. */
export interface BulkImportLabels {
  title: string;
  description: string;
  columnName: string;
}

export interface BulkImportDialogProps<T extends { id?: string | null }> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Extract the display name for a record row (the only truly page-specific piece). */
  getRecordLabel: (record: T) => string;
  /** Perform the upsert for a single record. Return the raw Response so the dialog can inspect `ok`/`status`. */
  upsertRecord: (record: T) => Promise<Response>;
  /** Called after the dialog closes when at least one row was processed (use to refetch list). */
  onComplete: () => void;
  /** Max number of upsert requests in flight at once. Defaults to 5. */
  concurrency?: number;
  /** Override the default `JSON.parse` + array check. */
  parseFile?: (text: string) => T[];
  labels: BulkImportLabels;
}

type CommonLabels = {
  selectFile: string;
  parseError: string;
  columnAction: string;
  actionInsert: string;
  actionUpdate: string;
  columnStatus: string;
  statusPending: string;
  statusRunning: string;
  statusSuccess: string;
  statusError: string;
  statusConflict: string;
  confirm: string;
  cancel: string;
  close: string;
};

function defaultParseFile<T>(text: string): T[] {
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) {
    throw new Error('Expected a JSON array of records');
  }
  return parsed as T[];
}

function StatusCell({ result, common }: { result: ItemResult; common: CommonLabels }) {
  switch (result.status) {
    case 'pending':
      return (
        <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <Minus className="size-4" />
          {common.statusPending}
        </span>
      );
    case 'running':
      return (
        <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <Loader2 className="size-4 animate-spin" />
          {common.statusRunning}
        </span>
      );
    case 'success':
      return (
        <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
          <CircleCheck className="size-4" />
          {common.statusSuccess}
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

export function BulkImportDialog<T extends { id?: string | null }>({
  open,
  onOpenChange,
  getRecordLabel,
  upsertRecord,
  onComplete,
  concurrency = 5,
  parseFile,
  labels,
}: BulkImportDialogProps<T>) {
  const tCommon = useTranslations('admin.common.import');
  const common = useMemo<CommonLabels>(
    () => ({
      selectFile: tCommon('selectFile'),
      parseError: tCommon('parseError'),
      columnAction: tCommon('columnAction'),
      actionInsert: tCommon('actionInsert'),
      actionUpdate: tCommon('actionUpdate'),
      columnStatus: tCommon('columnStatus'),
      statusPending: tCommon('statusPending'),
      statusRunning: tCommon('statusRunning'),
      statusSuccess: tCommon('statusSuccess'),
      statusError: tCommon('statusError'),
      statusConflict: tCommon('statusConflict'),
      confirm: tCommon('confirm'),
      cancel: tCommon('cancel'),
      close: tCommon('close'),
    }),
    [tCommon],
  );

  const [records, setRecords] = useState<T[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [results, setResults] = useState<Record<number, ItemResult>>({});
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasRecords = records.length > 0;
  const hasResults = Object.keys(results).length > 0;
  const isDone = !isRunning && hasResults;

  const resetState = useCallback(() => {
    setRecords([]);
    setParseError(null);
    setResults({});
    setIsRunning(false);
    abortRef.current = false;
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setParseError(null);
      setResults({});
      try {
        const text = await file.text();
        const parsed = (parseFile ?? defaultParseFile<T>)(text);
        setRecords(parsed);
      } catch {
        setRecords([]);
        setParseError(common.parseError);
      }
    },
    [parseFile, common.parseError],
  );

  const handleConfirm = useCallback(async () => {
    setIsRunning(true);
    abortRef.current = false;

    await runWithConcurrency(
      records,
      async (record, index) => {
        setResults((prev) => ({ ...prev, [index]: { status: 'running' } }));
        const response = await upsertRecord(record);
        if (response.ok) {
          setResults((prev) => ({ ...prev, [index]: { status: 'success' } }));
        } else if (response.status === 409) {
          setResults((prev) => ({ ...prev, [index]: { status: 'error', error: common.statusConflict } }));
        } else {
          setResults((prev) => ({ ...prev, [index]: { status: 'error', error: common.statusError } }));
        }
      },
      concurrency,
      (settled) => {
        if (!settled.ok) {
          setResults((prev) =>
            prev[settled.index]?.status === 'running' || !prev[settled.index]
              ? { ...prev, [settled.index]: { status: 'error', error: common.statusError } }
              : prev,
          );
        }
      },
      () => abortRef.current,
    );

    setIsRunning(false);
  }, [records, upsertRecord, concurrency, common.statusConflict, common.statusError]);

  const handleClose = useCallback(() => {
    abortRef.current = true;
    const shouldNotify = hasResults;
    resetState();
    onOpenChange(false);
    if (shouldNotify) onComplete();
  }, [hasResults, resetState, onOpenChange, onComplete]);

  const previewRows = useMemo(
    () =>
      records.map((record, index) => ({
        key: index,
        name: getRecordLabel(record),
        isUpdate: Boolean(record.id),
        result: results[index] ?? { status: 'pending' as const },
      })),
    [records, getRecordLabel, results],
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value && !isRunning) handleClose();
      }}
    >
      <DialogContent showCloseButton={false} className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription>{labels.description}</DialogDescription>
        </DialogHeader>

        {!hasRecords ? (
          <div className="flex flex-col items-start gap-2 py-2">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isRunning}>
              <Upload className="mr-2 size-4" />
              {common.selectFile}
            </Button>
            <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleFileChange} />
            {parseError ? <p className="text-destructive text-sm">{parseError}</p> : null}
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>{labels.columnName}</TableHead>
                  <TableHead className="w-28">{common.columnAction}</TableHead>
                  <TableHead className="w-40">{common.columnStatus}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewRows.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>
                      <Badge variant={row.isUpdate ? 'secondary' : 'outline'}>{row.isUpdate ? common.actionUpdate : common.actionInsert}</Badge>
                    </TableCell>
                    <TableCell>
                      <StatusCell result={row.result} common={common} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter>
          {isDone ? (
            <Button variant="outline" onClick={handleClose}>
              {common.close}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isRunning}>
                {common.cancel}
              </Button>
              <Button onClick={handleConfirm} disabled={isRunning || !hasRecords}>
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {common.confirm}
                  </>
                ) : (
                  common.confirm
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
