// @vitest-environment jsdom

import {cleanup, render as renderUi} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';

vi.mock('@stylexjs/stylex', () => ({
  create: <Styles,>(styles: Styles) => styles,
  defineVars: <Vars,>(variables: Vars) => variables,
  keyframes: () => 'test-spin',
  props: (...styles: Array<Record<string, unknown> | undefined | false>) => ({
    style: Object.assign({}, ...styles.filter(Boolean)),
  }),
}));

import {Link, LinkProvider} from './LinkProvider.js';

afterEach(() => {
  cleanup();
});

describe('LinkProvider', () => {
  it('delegates a link to the host-supplied renderer', () => {
    const {getByTestId} = renderUi(
      <LinkProvider
        renderLink={({children, href}) => (
          <a data-testid="host-link" href={href}>
            {children}
          </a>
        )}
      >
        <Link href="/settings">Settings</Link>
      </LinkProvider>,
    );

    expect(getByTestId('host-link').getAttribute('href')).toBe('/settings');
  });

  it('renders a plain anchor when the host supplies no link renderer', () => {
    const {getByRole} = renderUi(
      <LinkProvider>
        <Link href="/settings">Settings</Link>
      </LinkProvider>,
    );

    expect(getByRole('link', {name: 'Settings'}).getAttribute('href')).toBe(
      '/settings',
    );
  });
});
