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

import {Eyebrow} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Eyebrow', () => {
  it('places the label inline without leaking the tone prop', () => {
    renderUi(<Eyebrow tone="muted">Updated</Eyebrow>);

    const label = screen.getByText('Updated');
    expect(label.tagName).toBe('SPAN');
    expect(label).not.toHaveAttribute('tone');
  });

  it('takes the second rank of ink until another is asked for', () => {
    renderUi(
      <>
        <Eyebrow>Workspace</Eyebrow>
        <Eyebrow tone="danger">Danger zone</Eyebrow>
      </>,
    );

    expect(screen.getByText('Workspace')).toHaveStyle({
      color: 'var(--kioku-ui-color-text-secondary)',
      fontSize: 'var(--kioku-ui-typography-font-size-xs)',
    });
    expect(screen.getByText('Danger zone')).toHaveStyle({
      color: 'var(--kioku-ui-status-danger-text)',
    });
  });
});
