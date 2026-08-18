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

import {Calendar} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Calendar', () => {
  it('names the grid and shows the anchored month', () => {
    renderUi(<Calendar defaultValue="2026-08-18" label="Release date" />);

    expect(screen.getByText('August 2026')).toBeVisible();
    expect(screen.getByRole('grid')).toBeVisible();
  });

  it('marks the selected date', () => {
    renderUi(
      <Calendar
        label="Release date"
        onValueChange={() => {}}
        value="2026-08-18"
      />,
    );

    expect(
      screen.getByRole('button', {name: /August 18, 2026/u}),
    ).toHaveAttribute('aria-current', 'date');
  });

  it('reports the date the reader picks', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderUi(
      <Calendar
        label="Release date"
        onValueChange={onValueChange}
        value="2026-08-18"
      />,
    );

    await user.click(screen.getByRole('button', {name: /August 20, 2026/u}));

    expect(onValueChange).toHaveBeenCalledWith('2026-08-20');
  });

  it('moves to the previous and next month', async () => {
    const user = userEvent.setup();
    renderUi(<Calendar defaultValue="2026-08-18" label="Release date" />);

    await user.click(screen.getByRole('button', {name: 'Previous month'}));
    expect(screen.getByText('July 2026')).toBeVisible();

    await user.click(screen.getByRole('button', {name: 'Next month'}));
    await user.click(screen.getByRole('button', {name: 'Next month'}));
    expect(screen.getByText('September 2026')).toBeVisible();
  });

  it('blocks dates outside the allowed range', () => {
    renderUi(
      <Calendar
        defaultValue="2026-08-18"
        label="Release date"
        min="2026-08-10"
      />,
    );

    expect(
      screen.getByRole('button', {name: /August 5, 2026/u}),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', {name: /August 18, 2026/u}),
    ).toBeEnabled();
  });

  it('keeps the grid to one tab stop', () => {
    renderUi(<Calendar defaultValue="2026-08-18" label="Release date" />);

    expect(
      screen.getByRole('button', {name: /August 18, 2026/u}),
    ).toHaveAttribute('tabindex', '0');
    expect(
      screen.getByRole('button', {name: /August 19, 2026/u}),
    ).toHaveAttribute('tabindex', '-1');
  });
});
