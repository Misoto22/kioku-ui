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

import {MobileNav} from './index.js';

afterEach(() => {
  cleanup();
});

function MobileNavFixture() {
  return (
    <MobileNav label="Open navigation">
      <a href="/releases">Releases</a>
    </MobileNav>
  );
}

describe('MobileNav', () => {
  it('keeps the drawer closed until the trigger is used', () => {
    renderUi(<MobileNavFixture />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Open navigation'}),
    ).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens a named modal drawer', async () => {
    const user = userEvent.setup();
    renderUi(<MobileNavFixture />);

    await user.click(screen.getByRole('button', {name: 'Open navigation'}));

    expect(
      screen.getByRole('dialog', {name: 'Open navigation'}),
    ).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('link', {name: 'Releases'})).toBeVisible();
  });

  it('freezes the page behind the drawer', async () => {
    const user = userEvent.setup();
    renderUi(<MobileNavFixture />);

    await user.click(screen.getByRole('button', {name: 'Open navigation'}));

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('closes through its dismiss control', async () => {
    const user = userEvent.setup();
    renderUi(<MobileNavFixture />);

    await user.click(screen.getByRole('button', {name: 'Open navigation'}));
    await user.click(screen.getByRole('button', {name: 'Close navigation'}));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
