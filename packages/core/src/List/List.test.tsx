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

import {List, ListItem} from './index.js';

afterEach(() => {
  cleanup();
});

describe('List', () => {
  it('exposes every entry through list semantics', () => {
    renderUi(
      <List>
        <ListItem>Draft</ListItem>
        <ListItem>Review</ListItem>
      </List>,
    );

    expect(screen.getByRole('list')).toBeVisible();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('emits an ordered element when reading order carries meaning', () => {
    const {container} = renderUi(
      <List variant="ordered">
        <ListItem>Install</ListItem>
      </List>,
    );

    expect(container.querySelector('ol')).toBeInTheDocument();
  });

  it('keeps list semantics when markers are removed', () => {
    const {container} = renderUi(
      <List variant="plain">
        <ListItem>Kioku</ListItem>
      </List>,
    );

    expect(container.querySelector('ul')).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toBeVisible();
  });
});
