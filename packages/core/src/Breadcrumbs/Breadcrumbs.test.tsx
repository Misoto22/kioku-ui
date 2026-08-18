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

import {Breadcrumbs} from './index.js';

afterEach(() => {
  cleanup();
});

const items = [
  {href: '/', label: 'Home'},
  {href: '/releases', label: 'Releases'},
  {label: 'Release 12'},
];

describe('Breadcrumbs', () => {
  it('exposes the trail as a named navigation landmark', () => {
    renderUi(<Breadcrumbs items={items} />);

    expect(screen.getByRole('navigation', {name: 'Breadcrumb'})).toBeVisible();
  });

  it('links every step except the current page', () => {
    renderUi(<Breadcrumbs items={items} />);

    expect(screen.getAllByRole('link')).toHaveLength(2);
    expect(
      screen.queryByRole('link', {name: 'Release 12'}),
    ).not.toBeInTheDocument();
  });

  it('marks the last step as the current page', () => {
    renderUi(<Breadcrumbs items={items} />);

    expect(screen.getByText('Release 12')).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('hides the separator from assistive technology', () => {
    const {container} = renderUi(<Breadcrumbs items={items} />);

    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
  });
});
