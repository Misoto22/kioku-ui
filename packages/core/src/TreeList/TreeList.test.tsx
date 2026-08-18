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

import {useState} from 'react';

import {TreeList, type TreeNode} from './index.js';

afterEach(() => {
  cleanup();
});

const nodes: readonly TreeNode[] = [
  {
    children: [
      {id: 'core', label: 'core'},
      {id: 'themes', label: 'themes'},
    ],
    id: 'packages',
    label: 'packages',
  },
  {id: 'readme', label: 'README.md'},
];

function TreeFixture() {
  const [expandedIds, setExpandedIds] = useState<readonly string[]>([]);
  const [selectedId, setSelectedId] = useState('');

  return (
    <TreeList
      expandedIds={expandedIds}
      label="Files"
      nodes={nodes}
      onExpandedChange={setExpandedIds}
      onSelect={setSelectedId}
      selectedId={selectedId}
    />
  );
}

describe('TreeList', () => {
  it('names the tree and its items', () => {
    renderUi(<TreeFixture />);

    expect(screen.getByRole('tree', {name: 'Files'})).toBeVisible();
    expect(screen.getAllByRole('treeitem')).toHaveLength(2);
  });

  it('marks a branch as closed until it is opened', async () => {
    const user = userEvent.setup();
    renderUi(<TreeFixture />);

    const branch = screen.getByRole('treeitem', {name: /packages/u});
    expect(branch).toHaveAttribute('aria-expanded', 'false');

    await user.click(branch);

    expect(screen.getByRole('treeitem', {name: /packages/u})).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getAllByRole('treeitem')).toHaveLength(4);
  });

  it('keeps the tree to one tab stop', () => {
    renderUi(<TreeFixture />);

    expect(screen.getByRole('treeitem', {name: /packages/u})).toHaveAttribute(
      'tabindex',
      '0',
    );
    expect(screen.getByRole('treeitem', {name: /README/u})).toHaveAttribute(
      'tabindex',
      '-1',
    );
  });

  it('opens a branch with the right arrow key', async () => {
    const user = userEvent.setup();
    renderUi(<TreeFixture />);

    screen.getByRole('treeitem', {name: /packages/u}).focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('treeitem', {name: /packages/u})).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });
});
