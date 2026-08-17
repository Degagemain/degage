'use client';

import type { PublicSimulation } from '@/actions/simulation/read';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { InlineCopy } from '@/app/components/inline-copy';
import { SimulationResultView } from '../components/simulation-result-view';
import styles from '../simulation.module.css';

type LoadState =
  | { status: 'loading' }
  | { status: 'not_found' }
  | { status: 'error'; message: string }
  | { status: 'ready'; simulation: PublicSimulation };

export default function SimulationResultPage() {
  const params = useParams<{ id: string }>();
  const t = useTranslations('simulationPublic');
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    const id = params.id;

    async function load() {
      setLoadState({ status: 'loading' });
      try {
        const res = await fetch(`/api/simulations/${id}`);
        if (cancelled) return;
        if (res.status === 404) {
          setLoadState({ status: 'not_found' });
          return;
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setLoadState({
            status: 'error',
            message: err?.errors?.[0]?.message ?? `Request failed (${res.status})`,
          });
          return;
        }
        const simulation = (await res.json()) as PublicSimulation;
        setLoadState({ status: 'ready', simulation });
      } catch (error) {
        if (cancelled) return;
        setLoadState({
          status: 'error',
          message: error instanceof Error ? error.message : 'An error occurred',
        });
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loadState.status === 'loading') {
    return (
      <div className={styles.root}>
        <div className={styles.page}>
          <p className={styles.body}>{t('resultPage.loading')}</p>
        </div>
      </div>
    );
  }

  if (loadState.status === 'not_found') {
    return (
      <div className={styles.root}>
        <div className={styles.page}>
          <h1 className={styles.title}>{t('resultPage.notFoundTitle')}</h1>
          <p className={styles.body}>
            <InlineCopy>{t('resultPage.notFoundBody')}</InlineCopy>
          </p>
          <div className={styles.buttonRow}>
            <Link href="/app/simulation" className={`${styles.btn} ${styles.btnPrimary}`}>
              {t('resultPage.startNewCta')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loadState.status === 'error') {
    return (
      <div className={styles.root}>
        <div className={styles.page}>
          <p className={styles.body}>{loadState.message}</p>
          <div className={styles.buttonRow}>
            <Link href="/app/simulation" className={`${styles.btn} ${styles.btnPrimary}`}>
              {t('resultPage.startNewCta')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <SimulationResultView simulation={loadState.simulation} />;
}
