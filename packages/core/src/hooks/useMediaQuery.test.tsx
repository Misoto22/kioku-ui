// @vitest-environment jsdom

import {act, cleanup, renderHook} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {useMediaQuery} from './useMediaQuery.js';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function stubMatchMedia(matches: boolean) {
  const listeners = new Set<() => void>();
  const state = {matches};

  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: state.matches,
    media: query,
    addEventListener: (_: string, listener: () => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_: string, listener: () => void) => {
      listeners.delete(listener);
    },
  }));

  return {
    set(next: boolean) {
      state.matches = next;
      for (const listener of listeners) listener();
    },
    get listenerCount() {
      return listeners.size;
    },
  };
}

describe('useMediaQuery', () => {
  it('reports the current match', () => {
    stubMatchMedia(true);

    const {result} = renderHook(() => useMediaQuery('(min-width: 40rem)'));

    expect(result.current).toBe(true);
  });

  it('re-renders when the match changes', () => {
    const media = stubMatchMedia(false);

    const {result} = renderHook(() => useMediaQuery('(min-width: 40rem)'));
    act(() => {
      media.set(true);
    });

    expect(result.current).toBe(true);
  });

  it('detaches its listener on unmount', () => {
    const media = stubMatchMedia(false);

    const {unmount} = renderHook(() => useMediaQuery('(min-width: 40rem)'));
    unmount();

    expect(media.listenerCount).toBe(0);
  });
});
