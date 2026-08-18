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

import {NavItem} from './index.js';

afterEach(() => {
  cleanup();
});

describe('NavItem', () => {
  it('links to its destination', () => {
    renderUi(<NavItem href="/releases">Releases</NavItem>);

    expect(screen.getByRole('link', {name: 'Releases'})).toHaveAttribute(
      'href',
      '/releases',
    );
  });

  it('marks the current destination for assistive technology', () => {
    renderUi(
      <NavItem current href="/releases">
        Releases
      </NavItem>,
    );

    expect(screen.getByRole('link', {name: 'Releases'})).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('leaves other destinations unmarked', () => {
    renderUi(<NavItem href="/releases">Releases</NavItem>);

    expect(screen.getByRole('link')).not.toHaveAttribute('aria-current');
  });
});
