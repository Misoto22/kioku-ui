// @vitest-environment jsdom

import {cleanup, renderHook} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {useDevWarning} from './useDevWarning.js';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('useDevWarning', () => {
  it('reports a broken contract once per mount', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const {rerender} = renderHook(() =>
      useDevWarning(true, 'Field needs a label.'),
    );
    rerender();

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith('Field needs a label.');
  });

  it('stays quiet while the contract holds', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    renderHook(() => useDevWarning(false, 'Field needs a label.'));

    expect(warn).not.toHaveBeenCalled();
  });
});
