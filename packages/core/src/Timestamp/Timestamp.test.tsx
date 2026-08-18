// @vitest-environment jsdom

import {cleanup, screen} from '@testing-library/react';
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

import {Timestamp} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Timestamp', () => {
  it('attaches the machine-readable value', () => {
    const {container} = renderUi(
      <Timestamp value="2026-08-18T09:30:00.000Z" />,
    );

    expect(container.querySelector('time')).toHaveAttribute(
      'datetime',
      '2026-08-18T09:30:00.000Z',
    );
  });

  it('uses a caller-supplied format for the visible text', () => {
    renderUi(
      <Timestamp
        format={() => 'moments ago'}
        value="2026-08-18T09:30:00.000Z"
      />,
    );

    expect(screen.getByText('moments ago')).toBeVisible();
  });

  it('shows the raw input when it is not a date', () => {
    const {container} = renderUi(<Timestamp value="not a date" />);

    expect(screen.getByText('not a date')).toBeVisible();
    expect(container.querySelector('time')).not.toHaveAttribute('datetime');
  });
});
