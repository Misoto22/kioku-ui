import {useCallback, useSyncExternalStore} from 'react';

function supportsMatchMedia() {
  return (
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  );
}

/**
 * Tracks a CSS media query as React state. Server renders report `false` so
 * the first client paint stays consistent with the markup React sent.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!supportsMatchMedia()) {
        return () => {};
      }

      const list = window.matchMedia(query);
      list.addEventListener('change', onStoreChange);
      return () => {
        list.removeEventListener('change', onStoreChange);
      };
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => (supportsMatchMedia() ? window.matchMedia(query).matches : false),
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
