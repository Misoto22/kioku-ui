// @vitest-environment jsdom

import {cleanup, screen} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {afterEach, describe, expect, it, vi} from 'vitest';

vi.mock('@stylexjs/stylex', () => ({
  create: <Styles,>(styles: Styles) => styles,
  defineVars: <Vars,>(variables: Vars) => variables,
  keyframes: () => 'test-spin',
  props: (...styles: Array<Record<string, unknown> | undefined>) => {
    const appliedStyles = Object.assign({}, ...styles);

    return {
      style: appliedStyles,
      'data-stylex-contract': JSON.stringify(appliedStyles),
    };
  },
}));

import {renderUi} from '@misoto22/kioku-ui-test-utils';

import {VisuallyHidden} from './index.js';

afterEach(() => {
  cleanup();
});

describe('VisuallyHidden', () => {
  it('hides VisuallyHidden text visually while preserving its accessible name', () => {
    renderUi(
      <button type="button">
        <VisuallyHidden>Open navigation</VisuallyHidden>
      </button>,
    );

    expect(screen.getByRole('button', {name: 'Open navigation'})).toBeVisible();
    const hiddenText = screen.getByText('Open navigation');
    const appliedStyles = JSON.parse(
      hiddenText.getAttribute('data-stylex-contract') ?? '{}',
    );
    expect(appliedStyles).toEqual({
      clip: 'rect(0 0 0 0)',
      clipPath: 'inset(50%)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      position: 'absolute',
      whiteSpace: 'nowrap',
      width: 1,
    });
  });
});
