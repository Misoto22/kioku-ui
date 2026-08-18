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

import {SideNav, SideNavSection} from './index.js';

afterEach(() => {
  cleanup();
});

describe('SideNav', () => {
  it('shows its sections and their headings', () => {
    renderUi(
      <SideNav>
        <SideNavSection title="Work">
          <a href="/releases">Releases</a>
        </SideNavSection>
      </SideNav>,
    );

    expect(screen.getByText('Work')).toBeVisible();
    expect(screen.getByRole('link', {name: 'Releases'})).toBeVisible();
  });

  it('pins footer content to the end of the rail', () => {
    renderUi(
      <SideNav footer={<button type="button">Sign out</button>}>
        <SideNavSection>
          <a href="/">Home</a>
        </SideNavSection>
      </SideNav>,
    );

    expect(screen.getByRole('button', {name: 'Sign out'})).toBeVisible();
  });

  it('drops the heading when a section has no title', () => {
    const {container} = renderUi(
      <SideNav>
        <SideNavSection>
          <a href="/">Home</a>
        </SideNavSection>
      </SideNav>,
    );

    expect(container.querySelector('p')).toBeNull();
  });
});
