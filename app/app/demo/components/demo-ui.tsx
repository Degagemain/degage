import Link from 'next/link';
import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';

import { cn } from '@/app/lib/utils';

import type { SubflowState } from '../lib/types';
import styles from '../demo.module.css';

export function DemoRoot({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(styles.root, className)}>{children}</div>;
}

export function DemoBackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={styles.backLink}>
      ← {children}
    </Link>
  );
}

export function DemoField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      {hint ? <p className={styles.fieldHint}>{hint}</p> : null}
      {children}
    </div>
  );
}

export function DemoInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(styles.input, props.className)} />;
}

export function DemoSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(styles.select, props.className)} />;
}

export function DemoBtn({
  variant = 'primary',
  small,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary'; small?: boolean }) {
  return (
    <button
      {...props}
      className={cn(styles.btn, variant === 'primary' ? styles.btnPrimary : styles.btnSecondary, small && styles.btnSmall, className)}
    />
  );
}

export function DemoPanel({ title, body, children }: { title: string; body?: string; children?: ReactNode }) {
  return (
    <div className={styles.panel}>
      <h3 className={styles.panelTitle}>{title}</h3>
      {body ? <p className={styles.panelBody}>{body}</p> : null}
      {children}
    </div>
  );
}

const STATE_LABELS: Record<Exclude<SubflowState, 'blocked'>, string> = {
  todo: 'Nog te doen',
  pending: 'In behandeling',
  done: 'Afgerond',
};

export function StateIcon({ state, inline }: { state: SubflowState; inline?: boolean }) {
  if (state === 'blocked') return null;

  const classMap = {
    todo: styles.stateIconTodo,
    pending: styles.stateIconPending,
    done: styles.stateIconDone,
  };

  const glyph = state === 'done' ? '✓' : state === 'pending' ? '…' : '○';

  return (
    <span
      className={cn(styles.stateIcon, !inline && styles.stateIconAbsolute, classMap[state])}
      title={STATE_LABELS[state]}
      aria-label={STATE_LABELS[state]}
    >
      {glyph}
    </span>
  );
}

export function SubflowInfoBanner({ children }: { children: ReactNode }) {
  return <div className={styles.subflowInfoBanner}>{children}</div>;
}
