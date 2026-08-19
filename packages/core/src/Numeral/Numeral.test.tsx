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

import {Numeral} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Numeral', () => {
  it('sets the figure inline in the mono face with tabular numerals', () => {
    renderUi(<Numeral>1,204</Numeral>);

    const figure = screen.getByText('1,204');
    expect(figure.tagName).toBe('SPAN');
    expect(figure).toHaveStyle({
      fontFamily: 'var(--kioku-ui-typography-font-family-mono)',
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: 'var(--kioku-ui-typography-letter-spacing-mono)',
    });
  });

  it('leaves the scale and the ink to whatever it is set inside', () => {
    renderUi(<Numeral>98.6</Numeral>);

    const figure = screen.getByText('98.6');
    expect(figure.style.fontSize).toBe('');
    expect(figure.style.color).toBe('');
  });
});
