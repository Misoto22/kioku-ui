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

import {Selector} from './index.js';

afterEach(() => {
  cleanup();
});

const options = [
  {label: 'Ada', value: 'ada'},
  {label: 'Grace', value: 'grace'},
  {label: 'Alan', value: 'alan', disabled: true},
];

describe('Selector', () => {
  it('offers every option through the native control', () => {
    renderUi(<Selector aria-label="Owner" options={options} />);

    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('reports the chosen value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderUi(
      <Selector
        aria-label="Owner"
        onValueChange={onValueChange}
        options={options}
        value="ada"
      />,
    );

    await user.selectOptions(screen.getByRole('combobox'), 'grace');

    expect(onValueChange).toHaveBeenCalledWith('grace');
  });

  it('adds a disabled prompt when asked', () => {
    renderUi(
      <Selector
        aria-label="Owner"
        options={options}
        placeholder="Choose an owner"
      />,
    );

    expect(
      screen.getByRole('option', {name: 'Choose an owner'}),
    ).toBeDisabled();
  });

  it('blocks a disabled option', () => {
    renderUi(<Selector aria-label="Owner" options={options} />);

    expect(screen.getByRole('option', {name: 'Alan'})).toBeDisabled();
  });
});
