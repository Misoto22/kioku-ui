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

import {StatusDot} from './index.js';

afterEach(() => {
  cleanup();
});

describe('StatusDot', () => {
  it('gives a status dot an accessible name', () => {
    renderUi(<StatusDot aria-label="Service available" tone="success" />);

    expect(
      screen.getByRole('status', {name: 'Service available'}),
    ).toBeVisible();
  });
});
