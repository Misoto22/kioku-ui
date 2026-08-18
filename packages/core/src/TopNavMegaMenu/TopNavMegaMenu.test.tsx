// @vitest-environment jsdom

import {cleanup, screen, waitFor} from '@testing-library/react';
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
import {TopNavMegaMenu, TopNavMegaMenuFeaturedCard} from './index.js';

afterEach(() => {
  cleanup();
});

const columns = [
  {
    title: 'Build',
    items: (
      <>
        <NavItem href="/components">Components</NavItem>
        <NavItem href="/templates">Templates</NavItem>
      </>
    ),
  },
  {title: 'Learn', items: <NavItem href="/docs">Docs</NavItem>},
];

describe('TopNavMegaMenu', () => {
  it('starts closed', () => {
    renderUi(<TopNavMegaMenu columns={columns} label="Product" />);

    expect(screen.getByRole('button', {name: /Product/u})).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('shows every column when opened', async () => {
    const user = userEvent.setup();
    renderUi(<TopNavMegaMenu columns={columns} label="Product" />);

    await user.click(screen.getByRole('button', {name: /Product/u}));

    await waitFor(() => {
      expect(screen.getByRole('link', {name: 'Components'})).toBeVisible();
    });
    expect(screen.getByText('Build')).toBeVisible();
    expect(screen.getByText('Learn')).toBeVisible();
  });

  it('places a featured entry beside the columns', async () => {
    const user = userEvent.setup();
    renderUi(
      <TopNavMegaMenu
        columns={columns}
        featured={
          <TopNavMegaMenuFeaturedCard
            description="Everything in the last release."
            href="/changelog"
            title="What’s new"
          />
        }
        label="Product"
      />,
    );

    await user.click(screen.getByRole('button', {name: /Product/u}));

    await waitFor(() => {
      expect(screen.getByRole('link', {name: /What’s new/u})).toHaveAttribute(
        'href',
        '/changelog',
      );
    });
  });
});

describe('TopNavMegaMenuFeaturedCard', () => {
  it('is one link for the whole card', () => {
    renderUi(
      <TopNavMegaMenuFeaturedCard
        description="Everything in the last release."
        href="/changelog"
        title="What’s new"
      />,
    );

    expect(screen.getAllByRole('link')).toHaveLength(1);
  });
});
