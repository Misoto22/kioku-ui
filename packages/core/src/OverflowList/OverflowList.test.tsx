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

import {Button} from '../Button/index.js';
import {OverflowList} from './index.js';

afterEach(() => {
  cleanup();
});

const entries = [
  {label: 'Publish', node: <Button>Publish</Button>},
  {label: 'Archive', node: <Button>Archive</Button>},
  {label: 'Duplicate', node: <Button>Duplicate</Button>},
  {label: 'Delete', node: <Button>Delete</Button>},
];

describe('OverflowList', () => {
  it('shows only the entries that fit', () => {
    renderUi(<OverflowList entries={entries} visibleCount={2} />);

    expect(screen.getByRole('button', {name: 'Publish'})).toBeVisible();
    expect(
      screen.queryByRole('button', {name: 'Delete'}),
    ).not.toBeInTheDocument();
  });

  it('counts what it folded away', () => {
    renderUi(<OverflowList entries={entries} visibleCount={2} />);

    expect(screen.getByRole('button', {name: 'More (2)'})).toBeVisible();
  });

  it('drops the overflow trigger when everything fits', () => {
    renderUi(<OverflowList entries={entries} visibleCount={4} />);

    expect(
      screen.queryByRole('button', {name: /More/u}),
    ).not.toBeInTheDocument();
  });

  it('runs a folded entry from the menu', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderUi(
      <OverflowList
        entries={[...entries.slice(0, 3), {...entries[3]!, onSelect}]}
        visibleCount={2}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'More (2)'}));
    await user.click(screen.getByRole('menuitem', {name: 'Delete'}));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
