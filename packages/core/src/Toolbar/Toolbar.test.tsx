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

import {Toolbar} from './index.js';

afterEach(() => {
  cleanup();
});

function ToolbarFixture({
  orientation,
}: {
  readonly orientation?: 'horizontal' | 'vertical';
}) {
  return (
    <Toolbar label="Text style" {...(orientation ? {orientation} : {})}>
      <button type="button">bold</button>
      <button type="button">italic</button>
      <button type="button">underline</button>
    </Toolbar>
  );
}

describe('Toolbar', () => {
  it('names the group and reports its axis', () => {
    renderUi(<ToolbarFixture />);

    expect(screen.getByRole('toolbar', {name: 'Text style'})).toHaveAttribute(
      'aria-orientation',
      'horizontal',
    );
  });

  it('walks between controls with the arrow keys', async () => {
    const user = userEvent.setup();
    renderUi(<ToolbarFixture />);

    screen.getByRole('button', {name: 'bold'}).focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('button', {name: 'italic'})).toHaveFocus();
  });

  it('reads vertical arrows when the toolbar is vertical', async () => {
    const user = userEvent.setup();
    renderUi(<ToolbarFixture orientation="vertical" />);

    screen.getByRole('button', {name: 'bold'}).focus();
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('button', {name: 'italic'})).toHaveFocus();
  });
});
