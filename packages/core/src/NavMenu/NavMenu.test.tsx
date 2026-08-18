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

import {NavItem} from '../NavItem/index.js';
import {NavMenu} from './index.js';

afterEach(() => {
  cleanup();
});

describe('NavMenu', () => {
  it('names the navigation landmark', () => {
    renderUi(
      <NavMenu label="Primary">
        <NavItem href="/">Home</NavItem>
      </NavMenu>,
    );

    expect(screen.getByRole('navigation', {name: 'Primary'})).toBeVisible();
  });

  it('announces how many destinations it holds', () => {
    renderUi(
      <NavMenu label="Primary">
        <NavItem href="/">Home</NavItem>
        <NavItem href="/releases">Releases</NavItem>
      </NavMenu>,
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
