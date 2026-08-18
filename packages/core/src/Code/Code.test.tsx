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

import {Code} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Code', () => {
  it('marks the fragment with code semantics', () => {
    renderUi(<Code>pnpm install</Code>);

    expect(screen.getByText('pnpm install').tagName).toBe('CODE');
  });
});
