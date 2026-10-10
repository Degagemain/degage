import { PublicPage } from '@/app/components/public/public-shell';
import { Skeleton } from '@/app/components/ui/skeleton';

export default function FaqShortLinkLoading() {
  return (
    <PublicPage>
      <Skeleton className="mb-6 h-8 w-40 rounded-lg" />
      <Skeleton className="mb-4 h-10 w-full max-w-lg" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </PublicPage>
  );
}
