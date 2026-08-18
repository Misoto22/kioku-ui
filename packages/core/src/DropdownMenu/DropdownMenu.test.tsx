// @vitest-environment jsdom

import {cleanup, screen, waitFor} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import {useRef, useState} from 'react';
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

import {DropdownMenu, DropdownMenuItem} from './index.js';

afterEach(() => {
  cleanup();
});

function MenuFixture({onPublish}: {readonly onPublish?: () => void}) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <div>
      <span ref={anchorRef}>
        <button onClick={() => setOpen(true)} type="button">
          actions
        </button>
      </span>
      <DropdownMenu
        anchorRef={anchorRef}
        label="Release actions"
        onDismiss={() => setOpen(false)}
        open={open}
      >
        <DropdownMenuItem onClick={onPublish}>Publish</DropdownMenuItem>
        <DropdownMenuItem>Archive</DropdownMenuItem>
        <DropdownMenuItem disabled>Delete</DropdownMenuItem>
      </DropdownMenu>
    </div>
  );
}

describe('DropdownMenu', () => {
  it('stays closed until the trigger opens it', () => {
    renderUi(<MenuFixture />);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('names the menu and its items', async () => {
    const user = userEvent.setup();
    renderUi(<MenuFixture />);

    await user.click(screen.getByRole('button', {name: 'actions'}));

    expect(screen.getByRole('menu', {name: 'Release actions'})).toBeVisible();
    expect(screen.getAllByRole('menuitem')).toHaveLength(3);
  });

  it('moves focus to the first item when it opens', async () => {
    const user = userEvent.setup();
    renderUi(<MenuFixture />);

    await user.click(screen.getByRole('button', {name: 'actions'}));

    await waitFor(() => {
      expect(screen.getByRole('menuitem', {name: 'Publish'})).toHaveFocus();
    });
  });

  it('walks between items with the arrow keys', async () => {
    const user = userEvent.setup();
    renderUi(<MenuFixture />);

    await user.click(screen.getByRole('button', {name: 'actions'}));
    await waitFor(() => {
      expect(screen.getByRole('menuitem', {name: 'Publish'})).toHaveFocus();
    });
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('menuitem', {name: 'Archive'})).toHaveFocus();
  });

  it('runs the item action when chosen', async () => {
    const user = userEvent.setup();
    const onPublish = vi.fn();
    renderUi(<MenuFixture onPublish={onPublish} />);

    await user.click(screen.getByRole('button', {name: 'actions'}));
    await user.click(screen.getByRole('menuitem', {name: 'Publish'}));

    expect(onPublish).toHaveBeenCalledTimes(1);
  });
});
