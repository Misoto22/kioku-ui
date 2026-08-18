// @vitest-environment jsdom

import {cleanup, fireEvent, screen} from '@testing-library/react';
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

import {Slider} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Slider', () => {
  it('reports its range through slider semantics', () => {
    renderUi(
      <Slider aria-label="Volume" defaultValue={40} max={80} min={20} />,
    );

    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('40');
    expect(slider).toHaveAttribute('min', '20');
    expect(slider).toHaveAttribute('max', '80');
  });

  it('announces a formatted value when one is supplied', () => {
    renderUi(
      <Slider
        aria-label="Volume"
        defaultValue={40}
        formatValue={(value) => `${value} percent`}
      />,
    );

    expect(screen.getByRole('slider')).toHaveAttribute(
      'aria-valuetext',
      '40 percent',
    );
  });

  it('reports the newly chosen number', () => {
    const onValueChange = vi.fn();
    renderUi(
      <Slider
        aria-label="Volume"
        onValueChange={onValueChange}
        step={5}
        value={40}
      />,
    );

    fireEvent.change(screen.getByRole('slider'), {target: {value: '45'}});

    expect(onValueChange).toHaveBeenCalledWith(45);
  });

  it('keeps a controlled value pinned until its owner updates', () => {
    renderUi(
      <Slider
        aria-label="Volume"
        onValueChange={() => {}}
        step={5}
        value={40}
      />,
    );

    fireEvent.change(screen.getByRole('slider'), {target: {value: '45'}});

    expect(screen.getByRole('slider')).toHaveValue('40');
  });
});
