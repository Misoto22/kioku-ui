import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect.js';

/**
 * Freezes document scrolling while `active` is true and compensates for the
 * scrollbar it removes, so the page behind an overlay does not shift.
 */
export function useScrollLock(active: boolean): void {
  useIsomorphicLayoutEffect(() => {
    if (!active) {
      return;
    }

    const {body, documentElement} = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingInlineEnd = body.style.paddingInlineEnd;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingInlineEnd = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingInlineEnd = previousPaddingInlineEnd;
    };
  }, [active]);
}
