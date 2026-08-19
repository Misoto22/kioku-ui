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

import {ResizeHandle} from './index.js';

afterEach(() => {
  cleanup();
});

describe('ResizeHandle', () => {
  it('reports its range as a separator a reader can reach', () => {
    renderUi(<ResizeHandle max={480} min={160} value={240} />);

    const handle = screen.getByRole('separator', {name: 'Resize panel'});
    expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    expect(handle).toHaveAttribute('aria-valuemax', '480');
    expect(handle).toHaveAttribute('aria-valuemin', '160');
    expect(handle).toHaveAttribute('aria-valuenow', '240');
    expect(handle).toHaveAttribute('tabindex', '0');
  });

  it('omits the value attributes the caller left out', () => {
    renderUi(<ResizeHandle label="Split editor" />);

    const handle = screen.getByRole('separator', {name: 'Split editor'});
    expect(handle).not.toHaveAttribute('aria-valuenow');
    expect(handle).not.toHaveAttribute('aria-valuemin');
    expect(handle).not.toHaveAttribute('aria-valuemax');
  });

  it('steps along its own axis with the arrow keys', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderUi(
      <ResizeHandle onValueChange={onValueChange} step={20} value={240} />,
    );

    screen.getByRole('separator').focus();
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{ArrowLeft}');
    await user.keyboard('{ArrowDown}');

    expect(onValueChange).toHaveBeenNthCalledWith(1, 260);
    expect(onValueChange).toHaveBeenNthCalledWith(2, 220);
    expect(onValueChange).toHaveBeenCalledTimes(2);
  });

  it('reads the cross axis when it lies horizontally', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderUi(
      <ResizeHandle
        onValueChange={onValueChange}
        orientation="horizontal"
        step={12}
        value={100}
      />,
    );

    const handle = screen.getByRole('separator');
    expect(handle).toHaveAttribute('aria-orientation', 'horizontal');

    handle.focus();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowRight}');

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(112);
  });

  it('jumps to its bounds and never leaves them', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderUi(
      <ResizeHandle
        max={300}
        min={200}
        onValueChange={onValueChange}
        value={200}
      />,
    );

    screen.getByRole('separator').focus();
    await user.keyboard('{ArrowLeft}');
    await user.keyboard('{End}');
    await user.keyboard('{Home}');

    expect(onValueChange).toHaveBeenNthCalledWith(1, 200);
    expect(onValueChange).toHaveBeenNthCalledWith(2, 300);
    expect(onValueChange).toHaveBeenNthCalledWith(3, 200);
  });
});
