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

import {AvatarGroup} from './index.js';

afterEach(() => {
  cleanup();
});

const members = [
  {name: 'Ada Lovelace'},
  {name: 'Alan Turing'},
  {name: 'Grace Hopper'},
  {name: 'Katherine Johnson'},
  {name: 'Margaret Hamilton'},
];

describe('AvatarGroup', () => {
  it('states how many people the group holds', () => {
    renderUi(<AvatarGroup label="Reviewers" members={members} />);

    expect(screen.getByRole('group', {name: 'Reviewers: 5'})).toBeVisible();
  });

  it('counts the people it does not draw', () => {
    renderUi(<AvatarGroup label="Reviewers" max={3} members={members} />);

    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('drops the overflow marker when everyone fits', () => {
    renderUi(<AvatarGroup label="Reviewers" members={members.slice(0, 2)} />);

    expect(screen.queryByText(/^\+/u)).not.toBeInTheDocument();
  });
});
