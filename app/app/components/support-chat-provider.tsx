'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { SupportChatDialog } from '@/app/components/support-chat-dialog';

type SupportChatContextValue = {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
};

const SupportChatContext = createContext<SupportChatContextValue | null>(null);

export function SupportChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const toggleChat = useCallback(() => setIsOpen((open) => !open), []);

  const value = useMemo(
    () => ({
      isOpen,
      openChat,
      closeChat,
      toggleChat,
    }),
    [isOpen, openChat, closeChat, toggleChat],
  );

  return (
    <SupportChatContext.Provider value={value}>
      {children}
      <SupportChatDialog open={isOpen} onOpenChange={setIsOpen} />
    </SupportChatContext.Provider>
  );
}

export const useSupportChat = (): SupportChatContextValue => {
  const context = useContext(SupportChatContext);
  if (!context) {
    throw new Error('useSupportChat must be used inside SupportChatProvider');
  }
  return context;
};
