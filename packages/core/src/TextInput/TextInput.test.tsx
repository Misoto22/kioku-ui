// @vitest-environment jsdom

import {cleanup, screen} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {userEvent} from '@testing-library/user-event';
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

import {TextInput} from './index.js';

afterEach(() => {
  cleanup();
});

describe('TextInput', () => {
  it('preserves native text-control state and host attributes', () => {
    renderUi(
      <TextInput
        aria-invalid="true"
        aria-label="Disabled input"
        data-host-prop="forwarded"
        disabled
        placeholder="Enter a value"
      />,
    );

    const input = screen.getByRole('textbox', {name: 'Disabled input'});
    expect(input).toBeDisabled();
    expect(input).toBeInvalid();
    expect(input).toHaveAttribute('data-host-prop', 'forwarded');
    expect(input).toHaveAttribute('placeholder', 'Enter a value');
  });
  it('supports uncontrolled and controlled text input contracts', async () => {
    const user = userEvent.setup();
    const onControlledChange = vi.fn();
    renderUi(
      <>
        <TextInput aria-label="Uncontrolled" defaultValue="Start" />
        <TextInput
          aria-label="Controlled"
          onValueChange={onControlledChange}
          value="Fixed"
        />
      </>,
    );

    const uncontrolled = screen.getByRole('textbox', {name: 'Uncontrolled'});
    await user.clear(uncontrolled);
    await user.type(uncontrolled, 'Changed');
    expect(uncontrolled).toHaveValue('Changed');

    const controlled = screen.getByRole('textbox', {name: 'Controlled'});
    await user.type(controlled, '!');
    expect(onControlledChange).toHaveBeenCalledWith('Fixed!');
    expect(controlled).toHaveValue('Fixed');
  });
});
