// @vitest-environment jsdom

import {act, cleanup, renderHook} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {afterEach, describe, expect, it} from 'vitest';

import {useAnnounce} from './useAnnounce.js';

afterEach(() => {
  cleanup();
});

describe('useAnnounce', () => {
  it('speaks through a polite live region by default', () => {
    const {result} = renderHook(() => useAnnounce());
    act(() => {
      result.current('Three results');
    });

    const region = document.querySelector('[role="status"]');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveTextContent('Three results');
  });

  it('raises urgency when asked', () => {
    const {result} = renderHook(() => useAnnounce());
    act(() => {
      result.current('Upload failed', 'assertive');
    });

    expect(document.querySelector('[role="status"]')).toHaveAttribute(
      'aria-live',
      'assertive',
    );
  });

  it('ignores an empty message instead of creating a region', () => {
    const {result} = renderHook(() => useAnnounce());
    act(() => {
      result.current('   ');
    });

    expect(document.querySelector('[role="status"]')).toBeNull();
  });

  it('removes its region on unmount', () => {
    const {result, unmount} = renderHook(() => useAnnounce());
    act(() => {
      result.current('Saved');
    });
    unmount();

    expect(document.querySelector('[role="status"]')).toBeNull();
  });
});
