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

import {TopNav} from './index.js';

afterEach(() => {
  cleanup();
});

describe('TopNav', () => {
  it('claims the page banner landmark', () => {
    renderUi(<TopNav brand="Kioku" />);

    expect(screen.getByRole('banner')).toBeVisible();
  });

  it('places brand, navigation, and actions together', () => {
    renderUi(
      <TopNav actions={<button type="button">Account</button>} brand="Kioku">
        <a href="/releases">Releases</a>
      </TopNav>,
    );

    expect(screen.getByText('Kioku')).toBeVisible();
    expect(screen.getByRole('link', {name: 'Releases'})).toBeVisible();
    expect(screen.getByRole('button', {name: 'Account'})).toBeVisible();
  });

  it('omits regions it was given no content for', () => {
    const {container} = renderUi(<TopNav brand="Kioku" />);

    expect(container.querySelectorAll('header > div')).toHaveLength(1);
  });
});
