// @vitest-environment jsdom

import {cleanup, renderHook} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {afterEach, describe, expect, it} from 'vitest';

import {useScrollLock} from './useScrollLock.js';

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
  document.body.style.paddingInlineEnd = '';
});

describe('useScrollLock', () => {
  it('freezes document scrolling while active', () => {
    renderHook(() => useScrollLock(true));

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('leaves scrolling alone while inactive', () => {
    renderHook(() => useScrollLock(false));

    expect(document.body.style.overflow).toBe('');
  });

  it('restores the previous overflow on unmount', () => {
    document.body.style.overflow = 'scroll';

    const {unmount} = renderHook(() => useScrollLock(true));
    unmount();

    expect(document.body.style.overflow).toBe('scroll');
  });
});
