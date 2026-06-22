'use client';

import { createContext, useContext } from 'react';

const StepReadOnlyContext = createContext(false);

export function StepReadOnlyProvider({ readOnly, children }: { readOnly: boolean; children: React.ReactNode }) {
  return <StepReadOnlyContext.Provider value={readOnly}>{children}</StepReadOnlyContext.Provider>;
}

export const useStepReadOnly = (): boolean => useContext(StepReadOnlyContext);
