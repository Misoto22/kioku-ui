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

import {Skeleton} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Skeleton', () => {
  it('keeps decorative skeletons hidden and labels announced loading placeholders', () => {
    renderUi(
      <>
        <Skeleton data-testid="decorative" />
        <Skeleton label="Loading summary" />
      </>,
    );

    expect(screen.getByTestId('decorative')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(
      screen.getByRole('status', {name: 'Loading summary'}),
    ).toHaveAttribute('aria-busy', 'true');
  });
});
