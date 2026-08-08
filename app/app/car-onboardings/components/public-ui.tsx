'use client';

import Link from 'next/link';
import { Info } from 'lucide-react';
import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/app/lib/utils';

import type { StepState } from '../lib/types';
import styles from '../car-onboarding-public.module.css';

export function PublicRoot({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(styles.root, className)}>{children}</div>;
}

export function PublicBackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={styles.backLink}>
      ← {children}
    </Link>
  );
}

export function PublicField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      {hint ? <p className={styles.fieldHint}>{hint}</p> : null}
      {children}
    </div>
  );
}

export function PublicInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(styles.input, props.className)} />;
}

export function PublicSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(styles.select, props.className)} />;
}

export function PublicBtn({
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

export function PublicPanel({ title, body, children }: { title?: string; body?: string; children?: ReactNode }) {
  return (
    <div className={styles.panel}>
      {title ? <h3 className={styles.panelTitle}>{title}</h3> : null}
      {body ? <p className={styles.panelBody}>{body}</p> : null}
      {children}
    </div>
  );
}

export function PublicInfoPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className={styles.infoPanel} role="note">
      <Info className={styles.infoPanelIcon} aria-hidden />
      <div className={styles.infoPanelContent}>
        <h3 className={styles.infoPanelTitle}>{title}</h3>
        <p className={styles.infoPanelBody}>{body}</p>
      </div>
    </div>
  );
}

export function StateIcon({ state, inline }: { state: StepState; inline?: boolean }) {
  const t = useTranslations('carOnboardingPublic.states');

  if (state === 'blocked') return null;

  const classMap = {
    todo: styles.stateIconTodo,
    pending: styles.stateIconPending,
    done: styles.stateIconDone,
  };

  const glyph = state === 'done' ? '✓' : state === 'pending' ? '…' : '○';
  const label = t(state);

  return (
    <span className={cn(styles.stateIcon, !inline && styles.stateIconAbsolute, classMap[state])} title={label} aria-label={label}>
      {glyph}
    </span>
  );
}

export function PublicReadOnlyValue({ label, value }: { label: string; value: string }) {
  return (
    <PublicField label={label}>
      <p className={styles.readOnlyValue}>{value || '—'}</p>
    </PublicField>
  );
}
