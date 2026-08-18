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

import {VStack} from './index.js';

afterEach(() => {
  cleanup();
});

describe('VStack', () => {
  it('lays its children out in a column', () => {
    const {container} = renderUi(
      <VStack>
        <p>one</p>
        <p>two</p>
      </VStack>,
    );

    expect(container.firstElementChild).toHaveStyle({
      flexDirection: 'column',
    });
  });

  it('spends the gap token it was asked for', () => {
    const {container} = renderUi(
      <VStack gap="lg">
        <p>one</p>
      </VStack>,
    );

    expect(container.firstElementChild?.getAttribute('style')).toContain(
      '--kioku-ui-spacing-lg',
    );
  });

  it('keeps every child reachable', () => {
    renderUi(
      <VStack>
        <p>one</p>
        <p>two</p>
      </VStack>,
    );

    expect(screen.getByText('one')).toBeVisible();
    expect(screen.getByText('two')).toBeVisible();
  });
});
