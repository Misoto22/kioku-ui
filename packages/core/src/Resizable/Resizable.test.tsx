// @vitest-environment jsdom

import {cleanup, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import {afterEach, describe, expect, it, vi} from 'vitest';

vi.mock('@stylexjs/stylex', () => ({
  create: <Styles,>(styles: Styles) => styles,
  defineVars: <Vars,>(variables: Vars) => variables,
  keyframes: () => 'test-spin',
  props: (...styles: Array<Record<string, unknown> | undefined | false>) => ({
    style: Object.assign({}, ...styles.filter(Boolean)),
  }),
}));

import {renderUi} from '@misoto22/kioku-ui-test-utils';

import {Resizable} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Resizable', () => {
  it('exposes the divider as a real control', () => {
    renderUi(
      <Resizable panel={<p>rail</p>}>
        <p>page</p>
      </Resizable>,
    );

    const handle = screen.getByRole('separator', {name: 'Resize panel'});
    expect(handle).toHaveAttribute('aria-valuenow', '240');
    expect(handle).toHaveAttribute('tabindex', '0');
  });

  it('moves the divider with the arrow keys', async () => {
    const user = userEvent.setup();
    const onSizeChange = vi.fn();
    renderUi(
      <Resizable
        onSizeChange={onSizeChange}
        panel={<p>rail</p>}
        size={240}
        step={20}
      >
        <p>page</p>
      </Resizable>,
    );

    screen.getByRole('separator').focus();
    await user.keyboard('{ArrowRight}');

    expect(onSizeChange).toHaveBeenCalledWith(260);
  });

  it('clamps the divider to its bounds', async () => {
    const user = userEvent.setup();
    const onSizeChange = vi.fn();
    renderUi(
      <Resizable
        max={300}
        min={200}
        onSizeChange={onSizeChange}
        panel={<p>rail</p>}
        size={200}
      >
        <p>page</p>
      </Resizable>,
    );

    screen.getByRole('separator').focus();
    await user.keyboard('{ArrowLeft}');

    expect(onSizeChange).toHaveBeenCalledWith(200);
  });
});
