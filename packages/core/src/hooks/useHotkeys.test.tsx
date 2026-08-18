// @vitest-environment jsdom

import {cleanup, render} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {
  useHotkeys,
  type HotkeyBindings,
  type HotkeyOptions,
} from './useHotkeys.js';

afterEach(() => {
  cleanup();
});

function HotkeyFixture({
  bindings,
  ...options
}: HotkeyOptions & {readonly bindings: HotkeyBindings}) {
  useHotkeys(bindings, options);
  return <div>listening</div>;
}

describe('useHotkeys', () => {
  it('runs the handler for a bare key', async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();
    render(<HotkeyFixture bindings={{Escape: onEscape}} />);

    await user.keyboard('{Escape}');

    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('matches a modifier combination regardless of how it is written', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<HotkeyFixture bindings={{'MOD+K': onSearch}} />);

    await user.keyboard('{Control>}k{/Control}');

    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it('ignores keys while disabled', async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();
    render(<HotkeyFixture bindings={{Escape: onEscape}} enabled={false} />);

    await user.keyboard('{Escape}');

    expect(onEscape).not.toHaveBeenCalled();
  });

  it('stops listening once unmounted', async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();
    const {unmount} = render(<HotkeyFixture bindings={{Escape: onEscape}} />);

    unmount();
    await user.keyboard('{Escape}');

    expect(onEscape).not.toHaveBeenCalled();
  });
});
