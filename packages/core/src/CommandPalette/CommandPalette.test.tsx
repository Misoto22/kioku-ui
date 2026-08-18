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

import {CommandPalette, type Command} from './index.js';

afterEach(() => {
  cleanup();
});

const commands: readonly Command[] = [
  {
    group: 'Release',
    id: 'publish',
    label: 'Publish release',
    shortcut: 'mod+p',
  },
  {group: 'Release', id: 'archive', label: 'Archive release'},
  {group: 'View', id: 'theme', label: 'Switch theme'},
];

describe('CommandPalette', () => {
  it('renders nothing while closed', () => {
    renderUi(
      <CommandPalette
        commands={commands}
        onDismiss={() => {}}
        onRun={() => {}}
        open={false}
      />,
    );

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('lists every command when opened', () => {
    renderUi(
      <CommandPalette
        commands={commands}
        onDismiss={() => {}}
        onRun={() => {}}
        open
      />,
    );

    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('narrows the list as the reader types', async () => {
    const user = userEvent.setup();
    renderUi(
      <CommandPalette
        commands={commands}
        onDismiss={() => {}}
        onRun={() => {}}
        open
      />,
    );

    await user.type(screen.getByRole('combobox'), 'theme');

    expect(screen.getAllByRole('option')).toHaveLength(1);
  });

  it('keeps focus in the field while naming the highlighted command', async () => {
    const user = userEvent.setup();
    renderUi(
      <CommandPalette
        commands={commands}
        onDismiss={() => {}}
        onRun={() => {}}
        open
      />,
    );

    const field = screen.getByRole('combobox');
    await user.keyboard('{ArrowDown}');

    expect(field).toHaveFocus();
    const active = field.getAttribute('aria-activedescendant');
    expect(document.getElementById(active ?? '')).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('runs the highlighted command on Enter', async () => {
    const user = userEvent.setup();
    const onRun = vi.fn();
    renderUi(
      <CommandPalette
        commands={commands}
        onDismiss={() => {}}
        onRun={onRun}
        open
      />,
    );

    await user.keyboard('{Enter}');

    expect(onRun).toHaveBeenCalledWith(commands[0]);
  });

  it('states when nothing matched', async () => {
    const user = userEvent.setup();
    renderUi(
      <CommandPalette
        commands={commands}
        onDismiss={() => {}}
        onRun={() => {}}
        open
      />,
    );

    await user.type(screen.getByRole('combobox'), 'zzz');

    expect(screen.getByText('No commands match')).toBeVisible();
  });
});
