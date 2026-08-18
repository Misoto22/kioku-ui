import {useCallback, type KeyboardEvent, type RefObject} from 'react';

import {reachableElements} from './focusableSelector.js';

/** Axis a roving-focus collection reads its arrow keys along. */
export type ListOrientation = 'horizontal' | 'vertical';

/** Options controlling how roving focus moves through a collection. */
export interface ListFocusOptions {
  readonly loop?: boolean;
  readonly orientation?: ListOrientation;
}

const nextKeys: Record<ListOrientation, string> = {
  horizontal: 'ArrowRight',
  vertical: 'ArrowDown',
};

const previousKeys: Record<ListOrientation, string> = {
  horizontal: 'ArrowLeft',
  vertical: 'ArrowUp',
};

function clamp(index: number, length: number, loop: boolean) {
  if (loop) {
    return (index + length) % length;
  }
  return Math.min(Math.max(index, 0), length - 1);
}

/**
 * Moves focus through a collection with arrow, Home, and End keys so the
 * collection occupies a single stop in the page tab order.
 */
export function useListFocus(
  ref: RefObject<HTMLElement | null>,
  {loop = true, orientation = 'vertical'}: ListFocusOptions = {},
) {
  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const container = ref.current;
      if (!container) {
        return;
      }

      const items = reachableElements(container);
      if (items.length === 0) {
        return;
      }

      const current = items.indexOf(document.activeElement as HTMLElement);
      let target: number | undefined;

      if (event.key === nextKeys[orientation]) {
        target = clamp(current + 1, items.length, loop);
      } else if (event.key === previousKeys[orientation]) {
        target = clamp(current - 1, items.length, loop);
      } else if (event.key === 'Home') {
        target = 0;
      } else if (event.key === 'End') {
        target = items.length - 1;
      }

      if (target === undefined) {
        return;
      }

      event.preventDefault();
      items[target]?.focus({preventScroll: true});
    },
    [loop, orientation, ref],
  );

  return {onKeyDown};
}
