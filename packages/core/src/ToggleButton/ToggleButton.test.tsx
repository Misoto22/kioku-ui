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

import {ToggleButton} from './index.js';

afterEach(() => {
  cleanup();
});

describe('ToggleButton', () => {
  it('reports its state through aria-pressed', () => {
    renderUi(<ToggleButton>Bold</ToggleButton>);

    expect(screen.getByRole('button', {name: 'Bold'})).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('stays pressed once activated', async () => {
    const user = userEvent.setup();
    renderUi(<ToggleButton>Bold</ToggleButton>);

    await user.click(screen.getByRole('button', {name: 'Bold'}));

    expect(screen.getByRole('button', {name: 'Bold'})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('reports the next state to a controlled owner', async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    renderUi(
      <ToggleButton onPressedChange={onPressedChange} pressed={false}>
        Bold
      </ToggleButton>,
    );

    await user.click(screen.getByRole('button', {name: 'Bold'}));

    expect(onPressedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('blocks activation while disabled', () => {
    renderUi(<ToggleButton disabled>Bold</ToggleButton>);

    expect(screen.getByRole('button', {name: 'Bold'})).toBeDisabled();
  });
});
