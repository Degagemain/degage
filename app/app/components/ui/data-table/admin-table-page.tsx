'use client';

import * as React from 'react';

import { cn } from '@/app/lib/utils';

type AdminTablePageProps = {
  toolbar: React.ReactNode;
  /** Table, loading skeleton, or error retry block */
  tableArea: React.ReactNode;
  pagination: React.ReactNode;
  className?: string;
};

export function AdminTablePage({ toolbar, tableArea, pagination, className }: AdminTablePageProps) {
  return (
    <div className={cn('flex min-h-0 flex-1 flex-col gap-3 pt-2 pb-2 md:pt-3 md:pb-2', className)}>
      <div className="shrink-0 px-3 md:px-4">{toolbar}</div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="border-border min-h-0 flex-1 overflow-auto border-t">{tableArea}</div>
        <div className="bg-background border-border shrink-0 border-t px-3 pt-2 pb-1 md:px-4 md:pb-1">{pagination}</div>
      </div>
    </div>
  );
}
