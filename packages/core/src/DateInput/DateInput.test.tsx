// @vitest-environment jsdom

import {cleanup} from '@testing-library/react';
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

import {DateInput} from './index.js';

afterEach(() => {
  cleanup();
});

describe('DateInput', () => {
  it('uses the native date control', () => {
    const {container} = renderUi(<DateInput aria-label="Release date" />);

    expect(container.querySelector('input')).toHaveAttribute('type', 'date');
  });

  it('exchanges values as ISO strings', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const {container} = renderUi(
      <DateInput aria-label="Release date" onValueChange={onValueChange} />,
    );

    await user.type(
      container.querySelector('input') as HTMLInputElement,
      '2026-08-18',
    );

    expect(onValueChange).toHaveBeenLastCalledWith('2026-08-18');
  });

  it('shows the controlled value', () => {
    const {container} = renderUi(
      <DateInput
        aria-label="Release date"
        onValueChange={() => {}}
        value="2026-08-18"
      />,
    );

    expect(container.querySelector('input')).toHaveValue('2026-08-18');
  });
});
