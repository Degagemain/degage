'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useSubflowReadOnly } from '../components/subflow-read-only-context';
import { useOnboarding } from './onboarding-context';
import type { OnboardingState, SubflowId } from './types';

export function useSubflowDraft<K extends SubflowId>(id: K) {
  const readOnly = useSubflowReadOnly();
  const { state, updateSubflow } = useOnboarding();
  const [draft, setDraft] = useState(state[id]);

  useEffect(() => {
    setDraft(state[id]);
  }, [state, id]);

  const patchDraft = useCallback(
    (data: Partial<OnboardingState[K]>) => {
      if (readOnly) return;
      setDraft((prev) => ({ ...prev, ...data }));
    },
    [readOnly],
  );

  const save = useCallback(() => {
    if (readOnly) return;
    updateSubflow(id, draft);
    toast.success('Opgeslagen');
  }, [draft, id, readOnly, updateSubflow]);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(state[id]);

  return { draft, patchDraft, save, isDirty, committed: state[id] };
}
