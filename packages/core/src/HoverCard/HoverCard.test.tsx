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

import {HoverCard} from './index.js';

afterEach(() => {
  cleanup();
});

describe('HoverCard', () => {
  it('stays hidden until the trigger is hovered', () => {
    renderUi(
      <HoverCard
        label="Author detail"
        content={<p>Ada Lovelace</p>}
        openDelay={0}
      >
        <button type="button">Ada</button>
      </HoverCard>,
    );

    expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();
  });

  it('previews its content on hover', async () => {
    const user = userEvent.setup();
    renderUi(
      <HoverCard
        label="Author detail"
        content={<p>Ada Lovelace</p>}
        openDelay={0}
      >
        <button type="button">Ada</button>
      </HoverCard>,
    );

    await user.hover(screen.getByRole('button', {name: 'Ada'}));

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeVisible();
    });
  });

  it('previews its content on keyboard focus', async () => {
    const user = userEvent.setup();
    renderUi(
      <HoverCard
        label="Author detail"
        content={<p>Ada Lovelace</p>}
        openDelay={0}
      >
        <button type="button">Ada</button>
      </HoverCard>,
    );

    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeVisible();
    });
  });

  it('stays open while the pointer moves into the preview', async () => {
    const user = userEvent.setup();
    renderUi(
      <HoverCard
        label="Author detail"
        closeDelay={50}
        content={<button type="button">Follow</button>}
        openDelay={0}
      >
        <button type="button">Ada</button>
      </HoverCard>,
    );

    await user.hover(screen.getByRole('button', {name: 'Ada'}));
    await waitFor(() => {
      expect(screen.getByRole('button', {name: 'Follow'})).toBeVisible();
    });
    await user.hover(screen.getByRole('button', {name: 'Follow'}));

    expect(screen.getByRole('button', {name: 'Follow'})).toBeVisible();
  });
});
