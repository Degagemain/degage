'use client';

import { Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/app/lib/utils';
import { Button } from '@/app/components/ui/button';

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  onSort?: (columnId: string, desc: boolean) => void;
}

export function DataTableColumnHeader<TData, TValue>({ column, title, className, onSort }: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn('text-xs font-medium tracking-wider uppercase', className)}>{title}</div>;
  }

  const isSorted = column.getIsSorted();

  const handleClick = () => {
    // Toggle: unsorted -> asc -> desc -> asc -> desc ...
    const nextDesc = isSorted === 'asc';
    column.toggleSorting(nextDesc);
    onSort?.(column.id, nextDesc);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button variant="ghost" size="sm" className="-ml-3 h-8 text-xs font-medium tracking-wider uppercase" onClick={handleClick}>
        <span>{title}</span>
        {isSorted === 'desc' ? (
          <ArrowDown className="ml-1.5 h-3.5 w-3.5" />
        ) : isSorted === 'asc' ? (
          <ArrowUp className="ml-1.5 h-3.5 w-3.5" />
        ) : (
          <ChevronsUpDown className="text-muted-foreground/50 ml-1.5 h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
