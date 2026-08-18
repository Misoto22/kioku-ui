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

import {ToggleButtonGroup} from './index.js';

afterEach(() => {
  cleanup();
});

const options = [
  {label: 'Left', value: 'left'},
  {label: 'Centre', value: 'centre'},
  {label: 'Right', value: 'right'},
];

function SingleFixture() {
  const [value, setValue] = useState('left');
  return (
    <ToggleButtonGroup
      label="Alignment"
      onValueChange={setValue}
      options={options}
      value={value}
    />
  );
}

function MultipleFixture() {
  const [value, setValue] = useState<readonly string[]>(['left']);
  return (
    <ToggleButtonGroup
      label="Formatting"
      onValueChange={setValue}
      options={options}
      selectionMode="multiple"
      value={value}
    />
  );
}

describe('ToggleButtonGroup', () => {
  it('names the group and reports each option state', () => {
    renderUi(<SingleFixture />);

    expect(screen.getByRole('group', {name: 'Alignment'})).toBeVisible();
    expect(screen.getByRole('button', {name: 'Left'})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('keeps exactly one option pressed in single mode', async () => {
    const user = userEvent.setup();
    renderUi(<SingleFixture />);

    await user.click(screen.getByRole('button', {name: 'Centre'}));

    expect(screen.getByRole('button', {name: 'Centre'})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', {name: 'Left'})).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('never empties a single-select group', async () => {
    const user = userEvent.setup();
    renderUi(<SingleFixture />);

    await user.click(screen.getByRole('button', {name: 'Left'}));

    expect(screen.getByRole('button', {name: 'Left'})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('lets several options hold in multiple mode', async () => {
    const user = userEvent.setup();
    renderUi(<MultipleFixture />);

    await user.click(screen.getByRole('button', {name: 'Right'}));

    expect(screen.getByRole('button', {name: 'Left'})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', {name: 'Right'})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('walks between options with the arrow keys', async () => {
    const user = userEvent.setup();
    renderUi(<SingleFixture />);

    screen.getByRole('button', {name: 'Left'}).focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('button', {name: 'Centre'})).toHaveFocus();
  });
});
