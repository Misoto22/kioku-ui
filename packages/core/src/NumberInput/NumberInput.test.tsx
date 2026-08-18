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

import {NumberInput} from './index.js';

afterEach(() => {
  cleanup();
});

describe('NumberInput', () => {
  it('accepts a number', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderUi(<NumberInput aria-label="Count" onValueChange={onValueChange} />);

    await user.type(screen.getByRole('spinbutton'), '12');

    expect(onValueChange).toHaveBeenLastCalledWith(12);
  });

  it('reports an empty field as undefined rather than zero', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderUi(
      <NumberInput
        aria-label="Count"
        defaultValue={7}
        onValueChange={onValueChange}
      />,
    );

    await user.clear(screen.getByRole('spinbutton'));

    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
  });

  it('shows an empty control when a controlled value is undefined', () => {
    renderUi(
      <NumberInput
        aria-label="Count"
        onValueChange={() => {}}
        value={undefined}
      />,
    );

    expect(screen.getByRole('spinbutton')).toHaveValue(null);
  });
});
