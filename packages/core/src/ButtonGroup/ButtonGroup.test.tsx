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

import {ButtonGroup} from './index.js';

afterEach(() => {
  cleanup();
});

describe('ButtonGroup', () => {
  it('names the group', () => {
    renderUi(
      <ButtonGroup label="Alignment">
        <button type="button">Left</button>
      </ButtonGroup>,
    );

    expect(screen.getByRole('group', {name: 'Alignment'})).toBeVisible();
  });

  it('walks between actions with the arrow keys', async () => {
    const user = userEvent.setup();
    renderUi(
      <ButtonGroup label="Alignment">
        <button type="button">Left</button>
        <button type="button">Centre</button>
      </ButtonGroup>,
    );

    screen.getByRole('button', {name: 'Left'}).focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('button', {name: 'Centre'})).toHaveFocus();
  });
});
