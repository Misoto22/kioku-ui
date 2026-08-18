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

import {CheckboxInput} from './index.js';

afterEach(() => {
  cleanup();
});

describe('CheckboxInput', () => {
  it('names the choice through its label', () => {
    renderUi(<CheckboxInput label="Notify subscribers" />);

    expect(
      screen.getByRole('checkbox', {name: /Notify subscribers/u}),
    ).not.toBeChecked();
  });

  it('records a choice when uncontrolled', async () => {
    const user = userEvent.setup();
    renderUi(<CheckboxInput label="Notify subscribers" />);

    await user.click(screen.getByRole('checkbox'));

    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('reports the next state to a controlled owner', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    renderUi(
      <CheckboxInput
        checked={false}
        label="Notify subscribers"
        onCheckedChange={onCheckedChange}
      />,
    );

    await user.click(screen.getByRole('checkbox'));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('shows a mixed state until the reader decides', () => {
    renderUi(<CheckboxInput indeterminate label="Notify subscribers" />);

    expect(screen.getByRole('checkbox')).toBePartiallyChecked();
  });

  it('blocks activation while disabled', () => {
    renderUi(<CheckboxInput disabled label="Notify subscribers" />);

    expect(screen.getByRole('checkbox')).toBeDisabled();
  });
});
