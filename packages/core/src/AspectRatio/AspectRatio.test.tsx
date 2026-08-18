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

import {AspectRatio} from './index.js';

afterEach(() => {
  cleanup();
});

describe('AspectRatio', () => {
  it('reserves space at the default ratio', () => {
    const {container} = renderUi(
      <AspectRatio>
        <p>framed</p>
      </AspectRatio>,
    );

    expect(container.firstElementChild).toHaveStyle({
      aspectRatio: String(16 / 9),
    });
  });

  it('honours an explicit ratio', () => {
    const {container} = renderUi(
      <AspectRatio ratio={1}>
        <p>framed</p>
      </AspectRatio>,
    );

    expect(container.firstElementChild).toHaveStyle({aspectRatio: '1'});
  });

  it('keeps its content reachable', () => {
    renderUi(
      <AspectRatio>
        <p>framed</p>
      </AspectRatio>,
    );

    expect(screen.getByText('framed')).toBeVisible();
  });
});
