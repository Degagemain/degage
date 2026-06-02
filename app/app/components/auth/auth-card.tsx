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
    <Card className={cn('border-border bg-card w-full max-w-sm shadow-sm', className)}>
      <CardHeader className="gap-1">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        {description ? <CardDescription className="text-sm">{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
