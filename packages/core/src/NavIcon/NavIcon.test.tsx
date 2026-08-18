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

import {NavIcon} from './index.js';

afterEach(() => {
  cleanup();
});

describe('NavIcon', () => {
  it('keeps the glyph out of the accessibility tree', () => {
    const {container} = renderUi(<NavIcon>*</NavIcon>);

    expect(container.querySelector('span')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('renders whatever glyph it is given', () => {
    renderUi(<NavIcon>*</NavIcon>);

    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
