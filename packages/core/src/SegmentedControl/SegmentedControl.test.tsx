// @vitest-environment jsdom

import {cleanup, screen} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {userEvent} from '@testing-library/user-event';
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

import {SegmentedControl} from './index.js';

afterEach(() => {
  cleanup();
});

describe('SegmentedControl', () => {
  it('moves segmented focus and selection with roving arrow keys while skipping disabled options', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderUi(
      <SegmentedControl
        aria-label="Alignment"
        defaultValue="start"
        onValueChange={onValueChange}
        options={[
          {label: 'Start', value: 'start'},
          {disabled: true, label: 'Center', value: 'center'},
          {label: 'End', value: 'end'},
        ]}
      />,
    );

    const start = screen.getByRole('radio', {name: 'Start'});
    const center = screen.getByRole('radio', {name: 'Center'});
    const end = screen.getByRole('radio', {name: 'End'});
    expect(start).toHaveAttribute('tabindex', '0');
    expect(center).toBeDisabled();
    expect(end).toHaveAttribute('tabindex', '-1');

    start.focus();
    await user.keyboard('{ArrowRight}');
    expect(end).toHaveFocus();
    expect(end).toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith('end');

    await user.keyboard('{ArrowRight}');
    expect(start).toHaveFocus();
    expect(start).toBeChecked();
  });
  it('rejects an unnamed segmented radiogroup and accepts aria-labelledby', () => {
    const options = [
      {label: 'Start', value: 'start'},
      {label: 'End', value: 'end'},
    ] as const;

    expect(() =>
      renderUi(
        <SegmentedControl
          {...({options} as unknown as Parameters<typeof SegmentedControl>[0])}
        />,
      ),
    ).toThrow('SegmentedControl requires an accessible name');

    renderUi(
      <>
        <span id="alignment-label">Alignment</span>
        <SegmentedControl aria-labelledby="alignment-label" options={options} />
      </>,
    );
    expect(screen.getByRole('radiogroup', {name: 'Alignment'})).toBeVisible();
  });
  it('keeps controlled segmented selection external while reporting keyboard intent', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const options = [
      {label: 'Start', value: 'start'},
      {label: 'End', value: 'end'},
    ] as const;
    const {rerender} = renderUi(
      <SegmentedControl
        aria-label="Alignment"
        onValueChange={onValueChange}
        options={options}
        value="start"
      />,
    );

    const start = screen.getByRole('radio', {name: 'Start'});
    const end = screen.getByRole('radio', {name: 'End'});
    start.focus();
    await user.keyboard('{ArrowRight}');
    expect(onValueChange).toHaveBeenLastCalledWith('end');
    expect(start).toBeChecked();
    expect(end).not.toBeChecked();

    rerender(
      <SegmentedControl
        aria-label="Alignment"
        onValueChange={onValueChange}
        options={options}
        value="end"
      />,
    );
    expect(end).toBeChecked();
    expect(end).toHaveAttribute('tabindex', '0');
  });
  it('supports Home and End while preserving fully disabled segmented behavior', async () => {
    const user = userEvent.setup();
    const onDisabledChange = vi.fn();
    renderUi(
      <>
        <SegmentedControl
          aria-label="Alignment"
          defaultValue="center"
          options={[
            {label: 'Start', value: 'start'},
            {label: 'Center', value: 'center'},
            {label: 'End', value: 'end'},
          ]}
        />
        <SegmentedControl
          aria-label="Disabled alignment"
          disabled
          onValueChange={onDisabledChange}
          options={[
            {label: 'Disabled start', value: 'start'},
            {label: 'Disabled end', value: 'end'},
          ]}
        />
      </>,
    );

    const center = screen.getByRole('radio', {name: 'Center'});
    center.focus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('radio', {name: 'Start'})).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('radio', {name: 'End'})).toHaveFocus();

    const disabledStart = screen.getByRole('radio', {name: 'Disabled start'});
    expect(disabledStart).toBeDisabled();
    await user.click(disabledStart);
    expect(onDisabledChange).not.toHaveBeenCalled();
  });
  it('uses vertical arrow keys only for a vertical segmented control', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderUi(
      <SegmentedControl
        aria-label="Priority"
        defaultValue="first"
        onValueChange={onValueChange}
        options={[
          {label: 'First', value: 'first'},
          {label: 'Second', value: 'second'},
        ]}
        orientation="vertical"
      />,
    );

    const first = screen.getByRole('radio', {name: 'First'});
    first.focus();
    await user.keyboard('{ArrowRight}');
    expect(first).toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalled();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', {name: 'Second'})).toHaveFocus();
    expect(onValueChange).toHaveBeenLastCalledWith('second');
  });
});
