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

import {MultiSelector} from './index.js';

afterEach(() => {
  cleanup();
});

const people = [
  {label: 'Ada Lovelace', value: 'ada'},
  {label: 'Grace Hopper', value: 'grace'},
];

describe('MultiSelector', () => {
  it('shows each chosen option with its own remove control', () => {
    renderUi(
      <MultiSelector
        label="Owners"
        onValueChange={() => {}}
        options={people}
        value={['ada']}
      />,
    );

    expect(screen.getByText('Ada Lovelace')).toBeVisible();
    expect(
      screen.getByRole('button', {name: 'Remove Ada Lovelace'}),
    ).toBeVisible();
  });

  it('removes one choice without clearing the rest', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderUi(
      <MultiSelector
        label="Owners"
        onValueChange={onValueChange}
        options={people}
        value={['ada', 'grace']}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Remove Ada Lovelace'}));

    expect(onValueChange).toHaveBeenCalledWith(['grace']);
  });

  it('offers only options that are not already chosen', async () => {
    const user = userEvent.setup();
    renderUi(
      <MultiSelector
        label="Owners"
        onValueChange={() => {}}
        options={people}
        value={['ada']}
      />,
    );

    await user.type(screen.getByRole('combobox'), 'o');

    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option')).toHaveTextContent('Grace Hopper');
  });
});
