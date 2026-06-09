'use client';

import { createContext, useContext } from 'react';

const SubflowReadOnlyContext = createContext(false);

export function SubflowReadOnlyProvider({ readOnly, children }: { readOnly: boolean; children: React.ReactNode }) {
  return <SubflowReadOnlyContext.Provider value={readOnly}>{children}</SubflowReadOnlyContext.Provider>;
}

export function useSubflowReadOnly() {
  return useContext(SubflowReadOnlyContext);
}
