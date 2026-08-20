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

import {DatePicker} from './index.js';

afterEach(() => {
  cleanup();
});

describe('DatePicker', () => {
  it('keeps the month grid closed until the trigger is pressed', async () => {
    renderUi(<DatePicker aria-label="Release" label="Release date" />);

    expect(screen.queryByRole('grid')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', {name: 'Choose a date'}));

    expect(screen.getByRole('grid', {name: 'Release date'})).toBeVisible();
  });

  it('opens its own grid rather than the platform picker', async () => {
    const showPicker = vi.fn();
    renderUi(<DatePicker label="Release date" />);
    const control = document.querySelector('input');
    if (control) {
      Object.defineProperty(control, 'showPicker', {value: showPicker});
    }

    await userEvent.click(screen.getByRole('button', {name: 'Choose a date'}));

    expect(showPicker).not.toHaveBeenCalled();
  });

  it('reports the day the reader chooses and returns focus to the field', async () => {
    const onValueChange = vi.fn();
    renderUi(
      <DatePicker
        label="Release date"
        onValueChange={onValueChange}
        value="2026-08-20"
      />,
    );

    await userEvent.click(screen.getByRole('button', {name: 'Choose a date'}));
    await userEvent.click(
      screen.getByRole('button', {name: /August 24, 2026/u}),
    );

    expect(onValueChange).toHaveBeenCalledWith('2026-08-24');
    expect(document.querySelector('input')).toHaveFocus();
  });

  it('names the field, not only the grid', () => {
    renderUi(<DatePicker label="Release date" />);

    expect(screen.getByLabelText('Release date')).toHaveAttribute(
      'type',
      'date',
    );
  });

  it('leaves the field to an external label when one is wired', () => {
    renderUi(
      <>
        <label htmlFor="release">Release</label>
        <DatePicker id="release" label="Release date" />
      </>,
    );

    expect(screen.getByLabelText('Release')).toHaveAttribute('type', 'date');
    expect(screen.queryByLabelText('Release date')).not.toBeInTheDocument();
  });

  it('carries its id to the field a label points at', () => {
    renderUi(
      <>
        <label htmlFor="release">Release</label>
        <DatePicker id="release" label="Release date" />
      </>,
    );

    expect(screen.getByLabelText('Release')).toHaveAttribute('type', 'date');
  });
});
