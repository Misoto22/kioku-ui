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

import {DropdownMenuItem} from '../DropdownMenu/index.js';
import {MoreMenu} from './index.js';

afterEach(() => {
  cleanup();
});

describe('MoreMenu', () => {
  it('names its trigger and marks it as a menu button', () => {
    renderUi(
      <MoreMenu label="More actions">
        <DropdownMenuItem>Archive</DropdownMenuItem>
      </MoreMenu>,
    );

    const trigger = screen.getByRole('button', {name: 'More actions'});
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens and closes its own menu', async () => {
    const user = userEvent.setup();
    renderUi(
      <MoreMenu label="More actions">
        <DropdownMenuItem>Archive</DropdownMenuItem>
      </MoreMenu>,
    );

    const trigger = screen.getByRole('button', {name: 'More actions'});
    await user.click(trigger);
    expect(screen.getByRole('menuitem', {name: 'Archive'})).toBeVisible();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
