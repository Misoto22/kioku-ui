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

import {Outline} from './index.js';

afterEach(() => {
  cleanup();
});

const entries = [
  {href: '#tokens', label: 'Tokens'},
  {depth: 2 as const, href: '#colour', label: 'Colour'},
  {href: '#themes', label: 'Themes'},
];

describe('Outline', () => {
  it('names the navigation landmark', () => {
    renderUi(<Outline entries={entries} />);

    expect(
      screen.getByRole('navigation', {name: 'On this page'}),
    ).toBeVisible();
  });

  it('links every heading', () => {
    renderUi(<Outline entries={entries} />);

    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('marks the reader position with aria-current', () => {
    renderUi(<Outline currentHref="#colour" entries={entries} />);

    expect(screen.getByRole('link', {name: 'Colour'})).toHaveAttribute(
      'aria-current',
      'location',
    );
    expect(screen.getByRole('link', {name: 'Tokens'})).not.toHaveAttribute(
      'aria-current',
    );
  });
});
