'use client';

import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

interface DataTablePaginationProps {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  totalItems: number;
  selectedCount?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function DataTablePagination({
  pageIndex,
  pageSize,
  pageCount,
  totalItems,
  selectedCount = 0,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  const t = useTranslations('dataTable.pagination');
  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;

  return (
    <div className="flex items-center justify-between py-1">
      <div className="text-muted-foreground text-xs">
        {selectedCount > 0
          ? t('selected', { selected: selectedCount, total: totalItems })
          : `${totalItems} ${totalItems === 1 ? t('result') : t('results')}`}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 md:flex">
          <span className="text-muted-foreground text-xs">{t('rowsPerPage')}</span>
          <Select value={`${pageSize}`} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger className="h-7 w-[68px] text-xs">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[20, 30, 50, 100].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-muted-foreground text-xs tabular-nums">{t('pageOf', { current: pageIndex + 1, total: pageCount || 1 })}</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-7" onClick={() => onPageChange(pageIndex - 1)} disabled={!canPreviousPage}>
            <span className="sr-only">{t('previousPage')}</span>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7" onClick={() => onPageChange(pageIndex + 1)} disabled={!canNextPage}>
            <span className="sr-only">{t('nextPage')}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
