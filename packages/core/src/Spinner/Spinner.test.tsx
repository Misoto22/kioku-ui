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

import {Spinner} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Spinner', () => {
  it('renders progress and loading feedback with accessible state', () => {
    renderUi(<Spinner label="Loading records" />);

    const status = screen.getByRole('status', {
      name: 'Loading records',
    });
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
});
