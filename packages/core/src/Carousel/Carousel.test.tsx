// @vitest-environment jsdom

import {cleanup, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';
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

import {Carousel} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Carousel', () => {
  it('names itself and says what kind of region it is', () => {
    renderUi(
      <Carousel label="Screenshots">
        <p>one</p>
      </Carousel>,
    );

    const region = screen.getByRole('group', {name: 'Screenshots'});
    expect(region).toHaveAttribute('aria-roledescription', 'carousel');
  });

  it('keeps the viewport reachable by keyboard', async () => {
    const user = userEvent.setup();
    renderUi(
      <Carousel label="Screenshots">
        <p>one</p>
        <p>two</p>
      </Carousel>,
    );

    await user.tab();

    expect(document.activeElement).toHaveTextContent('onetwo');
  });

  it('names both scroll controls', () => {
    renderUi(
      <Carousel label="Screenshots">
        <p>one</p>
      </Carousel>,
    );

    expect(screen.getByRole('button', {name: 'Previous'})).toBeVisible();
    expect(screen.getByRole('button', {name: 'Next'})).toBeVisible();
  });
});
