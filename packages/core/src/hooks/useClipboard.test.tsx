// @vitest-environment jsdom

import {act, cleanup, renderHook} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {useClipboard} from './useClipboard.js';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function stubClipboard(writeText: () => Promise<void>) {
  vi.stubGlobal('navigator', {clipboard: {writeText}});
}

describe('useClipboard', () => {
  it('reports success after the text reaches the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);

    const {result} = renderHook(() => useClipboard());
    await act(async () => {
      await result.current.copy('kioku');
    });

    expect(writeText).toHaveBeenCalledWith('kioku');
    expect(result.current.copied).toBe(true);
  });

  it('clears the confirmation after the reset window', async () => {
    vi.useFakeTimers();
    stubClipboard(vi.fn().mockResolvedValue(undefined));

    const {result} = renderHook(() => useClipboard(1000));
    await act(async () => {
      await result.current.copy('kioku');
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.copied).toBe(false);
  });

  it('reports failure when the clipboard rejects', async () => {
    stubClipboard(vi.fn().mockRejectedValue(new Error('denied')));

    const {result} = renderHook(() => useClipboard());
    let outcome = true;
    await act(async () => {
      outcome = await result.current.copy('kioku');
    });

    expect(outcome).toBe(false);
    expect(result.current.copied).toBe(false);
  });
});
