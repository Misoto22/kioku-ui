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

import {HStack} from './index.js';

afterEach(() => {
  cleanup();
});

describe('HStack', () => {
  it('lays its children out in a row', () => {
    const {container} = renderUi(
      <HStack>
        <p>one</p>
        <p>two</p>
      </HStack>,
    );

    expect(container.firstElementChild).toHaveStyle({flexDirection: 'row'});
  });

  it('keeps every child reachable', () => {
    renderUi(
      <HStack>
        <p>one</p>
        <p>two</p>
      </HStack>,
    );

    expect(screen.getByText('one')).toBeVisible();
    expect(screen.getByText('two')).toBeVisible();
  });
});
