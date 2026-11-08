'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { ContractStatus } from '@/domain/contract.model';
import { InlineCopy } from '@/app/components/inline-copy';
import { Button } from '@/app/components/ui/button';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';

import { useCarOnboarding } from '../../lib/car-onboarding-context';
import { PublicBackLink, PublicPanel, PublicRoot, StateIcon } from '../public-ui';
import { CarOnboardingFaq } from '../car-onboarding-faq';
import { getStepDefinition } from '../../lib/steps-config';
import { computeContractStepState } from '../../lib/compute-contract-step-state';
import styles from '../../car-onboarding-public.module.css';

export function ContractStep() {
  const t = useTranslations('carOnboardingPublic');
  const { carOnboarding, basePath, reload } = useCarOnboarding();
  const definition = getStepDefinition('contract');
  const stepState = computeContractStepState(carOnboarding);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!definition) {
    return (
      <PublicRoot>
        <p>{t('stepNotFound')}</p>
      </PublicRoot>
    );
  }

  if (stepState === 'blocked') {
    return (
      <PublicRoot>
        <PublicBackLink href={basePath}>{t('backToOverview')}</PublicBackLink>
        <h1 className={styles.pageTitle}>{t(definition.titleKey)}</h1>
        <p className={styles.pageIntro}>{t('steps.contract.waiting')}</p>
        <CarOnboardingFaq stepId="contract" />
      </PublicRoot>
    );
  }

  const handleDownload = async () => {
    const contractId = carOnboarding.contract?.id;
    if (!contractId) return;
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/contracts/${contractId}/document`);
      if (!response.ok) {
        const message = await parseApiErrorMessage(response, t('steps.contract.downloadError'));
        toast.error(message);
        return;
      }
      const data: { url: string } = await response.json();
      window.open(data.url, '_blank', 'noopener,noreferrer');
      await reload();
    } catch {
      toast.error(t('steps.contract.downloadError'));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <PublicRoot>
      <PublicBackLink href={basePath}>{t('backToOverview')}</PublicBackLink>
      <div className={styles.subflowTitleRow}>
        <h1 className={styles.pageTitle}>{t(definition.titleKey)}</h1>
        <StateIcon state={stepState} inline />
      </div>
      <PublicPanel>
        {carOnboarding.contract?.status === ContractStatus.Sent ? (
          <>
            <p className={styles.pageIntro}>
              <InlineCopy>{t('steps.contract.needsSignature')}</InlineCopy>
            </p>
            <p className={styles.pageIntro}>
              <InlineCopy>{t('steps.contract.checkEmail')}</InlineCopy>
            </p>
          </>
        ) : null}
        {carOnboarding.contract?.status === ContractStatus.Signed ? (
          <>
            <p className={styles.pageIntro}>
              <InlineCopy>{t('steps.contract.signed')}</InlineCopy>
            </p>
            <Button type="button" variant="outline" size="sm" disabled={isDownloading} onClick={() => void handleDownload()}>
              {isDownloading ? t('steps.contract.downloading') : t('steps.contract.download')}
            </Button>
          </>
        ) : null}
      </PublicPanel>
      <CarOnboardingFaq stepId="contract" />
    </PublicRoot>
  );
}
