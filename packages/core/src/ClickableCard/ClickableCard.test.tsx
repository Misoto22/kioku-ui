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

import {ClickableCard} from './index.js';

afterEach(() => {
  cleanup();
});

describe('ClickableCard', () => {
  it('is one control for the whole surface', () => {
    renderUi(<ClickableCard>Release 12</ClickableCard>);

    expect(screen.getByRole('button', {name: 'Release 12'})).toBeVisible();
  });

  it('runs its action when chosen', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderUi(<ClickableCard onClick={onClick}>Release 12</ClickableCard>);

    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
