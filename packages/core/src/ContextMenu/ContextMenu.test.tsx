// @vitest-environment jsdom

import {cleanup, fireEvent, screen} from '@testing-library/react';
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
import {ContextMenu} from './index.js';

afterEach(() => {
  cleanup();
});

function ContextMenuFixture() {
  return (
    <ContextMenu
      label="Row actions"
      menu={<DropdownMenuItem>Archive</DropdownMenuItem>}
    >
      <p>Release 12</p>
    </ContextMenu>
  );
}

describe('ContextMenu', () => {
  it('stays closed until a secondary click arrives', () => {
    renderUi(<ContextMenuFixture />);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens at the pointer on a secondary click', () => {
    renderUi(<ContextMenuFixture />);

    fireEvent.contextMenu(screen.getByText('Release 12'), {
      clientX: 40,
      clientY: 60,
    });

    expect(screen.getByRole('menu', {name: 'Row actions'})).toBeVisible();
  });

  it('closes again on Escape', async () => {
    const user = userEvent.setup();
    renderUi(<ContextMenuFixture />);

    fireEvent.contextMenu(screen.getByText('Release 12'));
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
