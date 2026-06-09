'use client';

import Link from 'next/link';

import { PublicPage } from '@/app/components/public/public-shell';

import { DemoRoot } from './components/demo-ui';
import { VARIANT_LABELS } from './lib/subflows-config';
import type { OnboardingVariant } from './lib/types';
import styles from './demo.module.css';

const VARIANTS: OnboardingVariant[] = ['new-car', 'regular'];

export default function DemoHubPage() {
  return (
    <PublicPage>
      <DemoRoot>
        <p className={styles.eyebrow}>Demo</p>
        <h1 className={styles.pageTitle}>Wagen-onboarding</h1>
        <p className={styles.pageIntro}>
          Verken varianten van de onboardingflow. Elke variant bewaart zijn eigen voortgang lokaal in je browser.
        </p>

        <div className={styles.variantGrid}>
          {VARIANTS.map((variant) => (
            <Link key={variant} href={`/app/demo/car-onboarding/${variant}`} className={styles.variantCard}>
              <h2 className={styles.variantCardTitle}>{VARIANT_LABELS[variant].title}</h2>
              <p className={styles.variantCardDesc}>{VARIANT_LABELS[variant].description}</p>
            </Link>
          ))}
        </div>
      </DemoRoot>
    </PublicPage>
  );
}
