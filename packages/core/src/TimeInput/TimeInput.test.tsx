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

import {TimeInput} from './index.js';

afterEach(() => {
  cleanup();
});

describe('TimeInput', () => {
  it('uses the native time control', () => {
    const {container} = renderUi(<TimeInput aria-label="Start time" />);

    expect(container.querySelector('input')).toHaveAttribute('type', 'time');
  });

  it('shows the controlled value', () => {
    const {container} = renderUi(
      <TimeInput
        aria-label="Start time"
        onValueChange={() => {}}
        value="09:30"
      />,
    );

    expect(container.querySelector('input')).toHaveValue('09:30');
  });
});
