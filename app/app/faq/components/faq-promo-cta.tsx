'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { Button } from '@/app/components/ui/button';

type Props = {
  href: string;
  children: React.ReactNode;
};

export function FaqPromoCta({ href, children }: Props) {
  return (
    <div className="mt-8 flex justify-end">
      <Button size="lg" className="min-w-[12rem] gap-2 px-8 text-base font-semibold shadow-sm" asChild>
        <Link href={href}>
          <span className="min-w-0">{children}</span>
          <ChevronRight className="size-5 shrink-0" aria-hidden />
        </Link>
      </Button>
    </div>
  );
}
