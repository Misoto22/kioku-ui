import {useCallback, useEffect, useRef} from 'react';

/** Urgency levels a live-region announcement can claim. */
export type AnnouncePoliteness = 'polite' | 'assertive';

const regionStyle =
  'position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0';

/**
 * Returns a function that speaks a message through an owned live region.
 * The region is created lazily and removed with the component that owns it.
 */
export function useAnnounce(): (
  message: string,
  politeness?: AnnouncePoliteness,
) => void {
  const regionRef = useRef<HTMLElement | null>(null);

  useEffect(
    () => () => {
      regionRef.current?.remove();
      regionRef.current = null;
    },
    [],
  );

  return useCallback(
    (message: string, politeness: AnnouncePoliteness = 'polite') => {
      if (typeof document === 'undefined' || message.trim() === '') {
        return;
      }

      let region = regionRef.current;
      if (!region) {
        region = document.createElement('div');
        region.setAttribute('role', 'status');
        region.setAttribute('style', regionStyle);
        document.body.append(region);
        regionRef.current = region;
      }

      region.setAttribute('aria-live', politeness);
      // Clearing first forces assistive technology to re-read an identical message.
      region.textContent = '';
      region.textContent = message;
    },
    [],
  );
}
