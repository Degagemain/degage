import type { ReactNode } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { cn } from '@/app/lib/utils';

type AuthCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function AuthCard({ title, description, children, className }: AuthCardProps) {
  return (
    <Card className={cn('w-full max-w-sm border-stone-200 bg-white shadow-sm', className)}>
      <CardHeader className="gap-1">
        <CardTitle className="text-xl font-semibold text-stone-900">{title}</CardTitle>
        {description ? <CardDescription className="text-sm text-stone-600">{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
