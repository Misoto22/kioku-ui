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

import {Icon} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Icon', () => {
  it('names a labelled icon for assistive technology', () => {
    renderUi(
      <Icon label="Search">
        <path d="M4 4h16v16H4Z" />
      </Icon>,
    );

    expect(screen.getByRole('img', {name: 'Search'})).toBeInTheDocument();
  });

  it('hides an unlabelled icon from the accessibility tree', () => {
    const {container} = renderUi(
      <Icon>
        <path d="M4 4h16v16H4Z" />
      </Icon>,
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('role');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('keeps a default drawing box so callers only supply paths', () => {
    const {container} = renderUi(
      <Icon>
        <path d="M4 4h16v16H4Z" />
      </Icon>,
    );

    expect(container.querySelector('svg')).toHaveAttribute(
      'viewBox',
      '0 0 24 24',
    );
  });
});
