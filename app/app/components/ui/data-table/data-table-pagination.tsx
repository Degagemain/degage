'use client';

import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

interface DataTablePaginationProps {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function DataTablePagination({ pageIndex, pageSize, pageCount, totalItems, onPageChange, onPageSizeChange }: DataTablePaginationProps) {
  const t = useTranslations('dataTable.pagination');
  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;

  return (
    <div className="flex items-center justify-between px-2">
      <div className="text-muted-foreground flex-1 text-sm">
        {totalItems} {totalItems === 1 ? t('result') : t('results')}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">{t('rowsPerPage')}</p>
          <Select value={`${pageSize}`} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 50, 100].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          {t('pageOf', { current: pageIndex + 1, total: pageCount || 1 })}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" className="hidden size-8 lg:flex" onClick={() => onPageChange(0)} disabled={!canPreviousPage}>
            <span className="sr-only">{t('firstPage')}</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="size-8" onClick={() => onPageChange(pageIndex - 1)} disabled={!canPreviousPage}>
            <span className="sr-only">{t('previousPage')}</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="size-8" onClick={() => onPageChange(pageIndex + 1)} disabled={!canNextPage}>
            <span className="sr-only">{t('nextPage')}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => onPageChange(pageCount - 1)}
            disabled={!canNextPage}
          >
            <span className="sr-only">{t('lastPage')}</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
