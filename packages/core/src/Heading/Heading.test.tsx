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

import {Heading} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Heading', () => {
  it('keeps the requested level and does not leak the family prop', () => {
    renderUi(
      <>
        <Heading level={2}>Interface heading</Heading>
        <Heading family="display" level={1}>
          Editorial title
        </Heading>
      </>,
    );

    const interfaceHeading = screen.getByRole('heading', {
      level: 2,
      name: 'Interface heading',
    });
    const displayHeading = screen.getByRole('heading', {
      level: 1,
      name: 'Editorial title',
    });

    expect(interfaceHeading.tagName).toBe('H2');
    expect(displayHeading.tagName).toBe('H1');
    expect(interfaceHeading).not.toHaveAttribute('family');
    expect(displayHeading).not.toHaveAttribute('family');
  });
});
