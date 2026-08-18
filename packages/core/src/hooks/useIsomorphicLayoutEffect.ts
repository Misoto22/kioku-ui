import {useEffect, useLayoutEffect} from 'react';

/**
 * Runs layout work before paint in the browser and falls back to a plain
 * effect on the server, where React cannot run layout effects at all.
 */
export const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;
