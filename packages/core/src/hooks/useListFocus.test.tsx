// @vitest-environment jsdom

import {cleanup, render, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import {useRef} from 'react';
import {afterEach, describe, expect, it} from 'vitest';

import {useListFocus, type ListFocusOptions} from './useListFocus.js';

afterEach(() => {
  cleanup();
});

function ListFixture(options: ListFocusOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const {onKeyDown} = useListFocus(ref, options);

  return (
    <div onKeyDown={onKeyDown} ref={ref}>
      <button type="button">one</button>
      <button type="button">two</button>
      <button type="button">three</button>
    </div>
  );
}

describe('useListFocus', () => {
  it('walks forward with the vertical arrow key', async () => {
    const user = userEvent.setup();
    render(<ListFixture />);

    screen.getByRole('button', {name: 'one'}).focus();
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('button', {name: 'two'})).toHaveFocus();
  });

  it('reads horizontal arrows when the collection is horizontal', async () => {
    const user = userEvent.setup();
    render(<ListFixture orientation="horizontal" />);

    screen.getByRole('button', {name: 'one'}).focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('button', {name: 'two'})).toHaveFocus();
  });

  it('wraps past the last item when looping', async () => {
    const user = userEvent.setup();
    render(<ListFixture />);

    screen.getByRole('button', {name: 'three'}).focus();
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('button', {name: 'one'})).toHaveFocus();
  });

  it('stops at the last item when looping is disabled', async () => {
    const user = userEvent.setup();
    render(<ListFixture loop={false} />);

    screen.getByRole('button', {name: 'three'}).focus();
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('button', {name: 'three'})).toHaveFocus();
  });

  it('jumps to the ends with Home and End', async () => {
    const user = userEvent.setup();
    render(<ListFixture />);

    screen.getByRole('button', {name: 'two'}).focus();
    await user.keyboard('{End}');
    expect(screen.getByRole('button', {name: 'three'})).toHaveFocus();

    await user.keyboard('{Home}');
    expect(screen.getByRole('button', {name: 'one'})).toHaveFocus();
  });
});
