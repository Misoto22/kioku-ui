// @vitest-environment jsdom

import {cleanup, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';
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
import {TopNavMenu} from './index.js';

afterEach(() => {
  cleanup();
});

function MenuFixture() {
  return (
    <TopNavMenu label="Product">
      <NavItem href="/overview">Overview</NavItem>
      <NavItem href="/pricing">Pricing</NavItem>
    </TopNavMenu>
  );
}

describe('TopNavMenu', () => {
  it('starts closed and says so', () => {
    renderUi(<MenuFixture />);

    expect(screen.getByRole('button', {name: /Product/u})).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('reveals its destinations as links, not menu items', async () => {
    const user = userEvent.setup();
    renderUi(<MenuFixture />);

    await user.click(screen.getByRole('button', {name: /Product/u}));

    expect(screen.getByRole('link', {name: 'Overview'})).toBeVisible();
    // A panel of links is a disclosure, not a menu of commands.
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    renderUi(<MenuFixture />);

    await user.click(screen.getByRole('button', {name: /Product/u}));
    await user.keyboard('{Escape}');

    expect(
      screen.queryByRole('link', {name: 'Overview'}),
    ).not.toBeInTheDocument();
  });
});
