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

import {AppShell} from './index.js';

afterEach(() => {
  cleanup();
});

describe('AppShell', () => {
  it('offers a skip link before anything else on the page', () => {
    renderUi(<AppShell>page</AppShell>);

    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAccessibleName('Skip to main content');
  });

  it('points the skip link at the main region', () => {
    const {container} = renderUi(<AppShell>page</AppShell>);

    const href = screen
      .getByRole('link', {name: 'Skip to main content'})
      .getAttribute('href');
    expect(href?.startsWith('#')).toBe(true);

    // The target must be `main` itself. Landing on the frame would drop the
    // reader above the banner, which is the thing the link exists to skip.
    const target = container.querySelector(`[id="${href?.slice(1)}"]`);
    expect(target).not.toBeNull();
    expect(target?.tagName).toBe('MAIN');
    expect(target).toBe(screen.getByRole('main'));
  });

  it('renames the skip link on request', () => {
    renderUi(<AppShell skipLinkLabel="Jump to content">page</AppShell>);

    expect(screen.getByRole('link', {name: 'Jump to content'})).toBeVisible();
  });
});
