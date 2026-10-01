import { cn } from '@/app/lib/utils';

import styles from './public-theme.module.css';

export function PublicHeroGlow() {
  return <div aria-hidden className={cn('pointer-events-none absolute inset-x-0 top-0 h-40', styles.heroGlow)} />;
}
