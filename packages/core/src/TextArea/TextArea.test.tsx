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

import {TextArea} from './index.js';

afterEach(() => {
  cleanup();
});

describe('TextArea', () => {
  it('preserves a native read-only text area', () => {
    renderUi(
      <TextArea aria-label="Read-only area" defaultValue="Locked" readOnly />,
    );

    expect(
      screen.getByRole('textbox', {name: 'Read-only area'}),
    ).toHaveAttribute('readonly');
  });
  it('supports uncontrolled and controlled text area contracts', async () => {
    const user = userEvent.setup();
    const onControlledChange = vi.fn();
    renderUi(
      <>
        <TextArea aria-label="Uncontrolled area" defaultValue="Start" />
        <TextArea
          aria-label="Controlled area"
          onValueChange={onControlledChange}
          value="Fixed"
        />
      </>,
    );

    const uncontrolled = screen.getByRole('textbox', {
      name: 'Uncontrolled area',
    });
    await user.clear(uncontrolled);
    await user.type(uncontrolled, 'Changed');
    expect(uncontrolled).toHaveValue('Changed');

    const controlled = screen.getByRole('textbox', {name: 'Controlled area'});
    await user.type(controlled, '!');
    expect(onControlledChange).toHaveBeenCalledWith('Fixed!');
    expect(controlled).toHaveValue('Fixed');
  });
});
