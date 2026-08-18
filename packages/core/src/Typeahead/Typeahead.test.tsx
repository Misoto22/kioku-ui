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

import {Typeahead, type TypeaheadOption} from './index.js';

afterEach(() => {
  cleanup();
});

const people: readonly TypeaheadOption[] = [
  {label: 'Ada Lovelace', value: 'ada'},
  {label: 'Alan Turing', value: 'alan'},
  {label: 'Grace Hopper', value: 'grace'},
];

function TypeaheadFixture({
  onChoose,
}: {
  readonly onChoose?: (value: string) => void;
}) {
  const [query, setQuery] = useState('');
  const matches = people.filter((person) =>
    person.label.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Typeahead
      aria-label="Owner"
      inputValue={query}
      onInputValueChange={setQuery}
      onSelect={(option) => {
        setQuery(option.label);
        onChoose?.(option.value);
      }}
      options={matches}
    />
  );
}

describe('Typeahead', () => {
  it('stays collapsed until the reader types', () => {
    renderUi(<TypeaheadFixture />);

    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('offers the matching suggestions', async () => {
    const user = userEvent.setup();
    renderUi(<TypeaheadFixture />);

    await user.type(screen.getByRole('combobox'), 'a');

    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('names the highlighted option without moving focus', async () => {
    const user = userEvent.setup();
    renderUi(<TypeaheadFixture />);

    const input = screen.getByRole('combobox');
    await user.type(input, 'a');
    await user.keyboard('{ArrowDown}');

    expect(input).toHaveFocus();
    const active = input.getAttribute('aria-activedescendant');
    expect(document.getElementById(active ?? '')).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('chooses the highlighted option on Enter', async () => {
    const user = userEvent.setup();
    const onChoose = vi.fn();
    renderUi(<TypeaheadFixture onChoose={onChoose} />);

    await user.type(screen.getByRole('combobox'), 'grace');
    await user.keyboard('{Enter}');

    expect(onChoose).toHaveBeenCalledWith('grace');
  });

  it('states when nothing matched', async () => {
    const user = userEvent.setup();
    renderUi(<TypeaheadFixture />);

    await user.type(screen.getByRole('combobox'), 'zzz');

    expect(screen.getByText('No matches')).toBeVisible();
  });
});
