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

import {ComplexSelector} from './index.js';

afterEach(() => {
  cleanup();
});

const groups = [
  {label: 'Engineering', options: [{label: 'Ada', value: 'ada'}]},
  {
    label: 'Design',
    options: [
      {label: 'Grace', value: 'grace'},
      {label: 'Alan', value: 'alan'},
    ],
  },
];

describe('ComplexSelector', () => {
  it('announces which group an option belongs to', () => {
    const {container} = renderUi(
      <ComplexSelector aria-label="Owner" groups={groups} />,
    );

    expect(container.querySelectorAll('optgroup')).toHaveLength(2);
    expect(container.querySelector('optgroup')).toHaveAttribute(
      'label',
      'Engineering',
    );
  });

  it('reports the chosen value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderUi(
      <ComplexSelector
        aria-label="Owner"
        groups={groups}
        onValueChange={onValueChange}
        value="ada"
      />,
    );

    await user.selectOptions(screen.getByRole('combobox'), 'grace');

    expect(onValueChange).toHaveBeenCalledWith('grace');
  });
});
