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

import {Text} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Text', () => {
  it('renders every tone as a paragraph without leaking the prop', () => {
    renderUi(
      <>
        <Text tone="secondary">Supporting copy</Text>
        <Text tone="muted">Updated recently</Text>
      </>,
    );

    expect(screen.getByText('Supporting copy').tagName).toBe('P');
    expect(screen.getByText('Updated recently').tagName).toBe('P');
    expect(screen.getByText('Supporting copy')).not.toHaveAttribute('tone');
    expect(screen.getByText('Updated recently')).not.toHaveAttribute('tone');
  });
});
