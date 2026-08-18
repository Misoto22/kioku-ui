// @vitest-environment jsdom

import {cleanup} from '@testing-library/react';
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

import {DateTimeInput} from './index.js';

afterEach(() => {
  cleanup();
});

describe('DateTimeInput', () => {
  it('uses the native local date-time control', () => {
    const {container} = renderUi(<DateTimeInput aria-label="Publish at" />);

    expect(container.querySelector('input')).toHaveAttribute(
      'type',
      'datetime-local',
    );
  });

  it('shows the controlled value', () => {
    const {container} = renderUi(
      <DateTimeInput
        aria-label="Publish at"
        onValueChange={() => {}}
        value="2026-08-18T09:30"
      />,
    );

    expect(container.querySelector('input')).toHaveValue('2026-08-18T09:30');
  });
});
