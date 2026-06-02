'use client';

import { useEffect } from 'react';

export function PublicLightTheme() {
  useEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains('dark');
    root.classList.remove('dark');

    return () => {
      if (hadDark) {
        root.classList.add('dark');
      }
    };
  }, []);

  return null;
}
