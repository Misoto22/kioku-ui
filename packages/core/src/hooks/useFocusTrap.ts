import {useEffect} from 'react';

import {focusableElements} from './focusableSelector.js';

/**
 * Confines Tab and Shift+Tab to the descendants of `container` while `active`
 * is true, then returns focus to whatever held it before the trap opened.
 *
 * The container is passed as an element rather than a ref because portalled
 * surfaces mount after their owner renders; a ref would still read `null`
 * when this effect first runs, and the trap would never arm.
 */
export function useFocusTrap(
  container: HTMLElement | null,
  active: boolean,
): void {
  useEffect(() => {
    if (!active || !container) {
      return;
    }

    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const [initial] = focusableElements(container);
    (initial ?? container).focus({preventScroll: true});

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab' || !container) {
        return;
      }

      const focusable = focusableElements(container);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const target = document.activeElement;

      if (event.shiftKey && (target === first || !container.contains(target))) {
        event.preventDefault();
        last?.focus({preventScroll: true});
        return;
      }
      if (!event.shiftKey && target === last) {
        event.preventDefault();
        first?.focus({preventScroll: true});
      }
    }

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      previous?.focus({preventScroll: true});
    };
  }, [active, container]);
}
