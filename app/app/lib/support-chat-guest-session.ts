const STORAGE_KEY = 'support-chat-guest-session';

export type SupportChatGuestSession = {
  conversationId: string;
  guestToken: string;
};

export const readSupportChatGuestSession = (): SupportChatGuestSession | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<SupportChatGuestSession>;
    if (typeof parsed.conversationId !== 'string' || typeof parsed.guestToken !== 'string') {
      return null;
    }

    return {
      conversationId: parsed.conversationId,
      guestToken: parsed.guestToken,
    };
  } catch {
    return null;
  }
};

export const writeSupportChatGuestSession = (session: SupportChatGuestSession): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const clearSupportChatGuestSession = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
};
