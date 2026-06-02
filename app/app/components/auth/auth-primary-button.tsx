import type { ComponentProps } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/lib/utils';

type AuthPrimaryButtonProps = ComponentProps<typeof Button> & {
  loading?: boolean;
};

export function AuthPrimaryButton({ loading, children, className, disabled, ...props }: AuthPrimaryButtonProps) {
  return (
    <Button
      type="submit"
      disabled={disabled || loading}
      className={cn('h-10 w-full rounded-full border-0 bg-[var(--public-brand)] text-white hover:bg-[var(--public-brand-hover)]', className)}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : children}
    </Button>
  );
}
