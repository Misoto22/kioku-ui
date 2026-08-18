// @vitest-environment jsdom

import {cleanup, screen} from '@testing-library/react';
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

import {ProgressBar} from './index.js';

afterEach(() => {
  cleanup();
});

describe('ProgressBar', () => {
  it('reports determinate progress', () => {
    renderUi(<ProgressBar label="Uploading" value={40} />);

    const bar = screen.getByRole('progressbar', {name: 'Uploading'});
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('omits the value when the length is unknown', () => {
    renderUi(<ProgressBar label="Uploading" />);

    expect(screen.getByRole('progressbar')).not.toHaveAttribute(
      'aria-valuenow',
    );
  });

  it('clamps a value outside the range', () => {
    renderUi(<ProgressBar label="Uploading" value={140} />);

    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
  });
});
