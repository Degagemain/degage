'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';

import { PublicPage } from '@/app/components/public/public-shell';

import { SubflowRenderer } from '../../../components/subflow-renderer';
import { getSubflowDefinition } from '../../../lib/subflows-config';
import type { OnboardingVariant, SubflowId } from '../../../lib/types';

export default function SubflowDetailPage({ params }: { params: Promise<{ variant: string; subflowId: string }> }) {
  const { variant, subflowId } = use(params);
  const definition = getSubflowDefinition(subflowId as SubflowId);

  if (!definition || !definition.variants.includes(variant as OnboardingVariant)) {
    notFound();
  }

  return (
    <PublicPage narrow>
      <SubflowRenderer subflowId={definition.id} />
    </PublicPage>
  );
}
