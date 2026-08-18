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

import {DateRangeInput} from './index.js';

afterEach(() => {
  cleanup();
});

describe('DateRangeInput', () => {
  it('names both bounds', () => {
    renderUi(<DateRangeInput legend="Reporting period" />);

    expect(screen.getByRole('group', {name: 'Reporting period'})).toBeVisible();
    expect(screen.getByLabelText('Start')).toBeVisible();
    expect(screen.getByLabelText('End')).toBeVisible();
  });

  it('stops the end date falling before the start', () => {
    renderUi(
      <DateRangeInput
        legend="Reporting period"
        onValueChange={() => {}}
        value={{end: '', start: '2026-08-01'}}
      />,
    );

    expect(screen.getByLabelText('End')).toHaveAttribute('min', '2026-08-01');
  });

  it('stops the start date passing the end', () => {
    renderUi(
      <DateRangeInput
        legend="Reporting period"
        onValueChange={() => {}}
        value={{end: '2026-08-31', start: ''}}
      />,
    );

    expect(screen.getByLabelText('Start')).toHaveAttribute('max', '2026-08-31');
  });

  it('reports both bounds together', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderUi(
      <DateRangeInput
        legend="Reporting period"
        onValueChange={onValueChange}
        value={{end: '', start: ''}}
      />,
    );

    await user.type(screen.getByLabelText('Start'), '2026-08-01');

    expect(onValueChange).toHaveBeenLastCalledWith({
      end: '',
      start: '2026-08-01',
    });
  });
});
