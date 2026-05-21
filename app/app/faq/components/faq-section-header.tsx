import Link from 'next/link';

import styles from '../faq.module.css';

type Props = {
  title: string;
  titleId?: string;
  moreHref: string;
  moreLabel: string;
};

export function FaqSectionHeader({ title, titleId, moreHref, moreLabel }: Props) {
  return (
    <div className={styles.sectionHeader}>
      <h2 id={titleId} className="text-lg font-bold tracking-tight text-[#181510]">
        {title}
      </h2>
      <Link href={moreHref} className={styles.sectionMoreLink}>
        {moreLabel}
        <span aria-hidden> →</span>
      </Link>
    </div>
  );
}
