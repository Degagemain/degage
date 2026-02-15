'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/app/components/ui/checkbox';
import { DataTableColumnHeader } from '@/app/components/ui/data-table';
import { Simulation } from '@/domain/simulation.model';
import { useTranslations } from 'next-intl';

interface ColumnOptions {
  onSort?: (columnId: string, desc: boolean) => void;
  t: (key: string) => string;
}

export const createColumns = (options: ColumnOptions): ColumnDef<Simulation>[] => {
  const { t, onSort } = options;
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'town',
      accessorFn: (row) => row.town?.name ?? '—',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.town')} onSort={onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.town?.name ?? '—'}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'resultCode',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.resultCode')} onSort={onSort} />,
      cell: ({ row }) => {
        const code = row.getValue('resultCode') as string;
        return <ResultCodeCell code={code} />;
      },
      enableHiding: true,
    },
    {
      accessorKey: 'brand',
      accessorFn: (row) => row.brand?.name ?? '—',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.brand')} onSort={onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.brand?.name ?? '—'}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'fuelType',
      accessorFn: (row) => row.fuelType?.name ?? '—',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.fuelType')} onSort={onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.fuelType?.name ?? '—'}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'carType',
      accessorFn: (row) => row.carType?.name ?? (row.carTypeOther ? `Other: ${row.carTypeOther}` : '—'),
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.carType')} onSort={onSort} />,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.carType?.name ?? (row.original.carTypeOther ? `Other: ${row.original.carTypeOther}` : '—')}
        </span>
      ),
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'km',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.km')} onSort={onSort} />,
      cell: ({ row }) => {
        const km = row.getValue('km') as number;
        return <span className="font-mono text-sm">{km.toLocaleString()}</span>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'firstRegisteredAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.firstRegisteredAt')} onSort={onSort} />,
      cell: ({ row }) => {
        const date = row.getValue('firstRegisteredAt') as Date | string;
        return <span className="text-muted-foreground text-sm">{date ? new Date(date).toLocaleDateString() : '—'}</span>;
      },
      enableHiding: true,
    },
    {
      accessorKey: 'carTypeOther',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.carTypeOther')} onSort={onSort} />,
      cell: ({ row }) => {
        const value = row.getValue('carTypeOther') as string | null;
        return <span className="text-muted-foreground text-sm">{value ?? '—'}</span>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.created')} onSort={onSort} />,
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as Date | string | null;
        return <span className="text-muted-foreground text-sm">{date ? new Date(date).toLocaleString() : '—'}</span>;
      },
      enableHiding: true,
    },
  ];
};

function ResultCodeCell({ code }: { code: string }) {
  const t = useTranslations('simulation.resultCode');
  return <span className="text-sm">{t(code)}</span>;
}
