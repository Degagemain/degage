'use client';

import { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';

interface BulkActionsButtonProps {
  count: number;
  label: string;
  children: ReactNode;
}

export function BulkActionsButton({ count, label, children }: BulkActionsButtonProps) {
  if (count === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          {label} ({count})
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
