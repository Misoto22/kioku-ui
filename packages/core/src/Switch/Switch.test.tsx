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

import {Switch} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Switch', () => {
  it('exposes switch semantics', () => {
    renderUi(<Switch>Live updates</Switch>);

    expect(
      screen.getByRole('switch', {name: 'Live updates'}),
    ).not.toBeChecked();
  });

  it('applies the change immediately when uncontrolled', async () => {
    const user = userEvent.setup();
    renderUi(<Switch>Live updates</Switch>);

    await user.click(screen.getByRole('switch'));

    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('reports the next state to a controlled owner', async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    renderUi(
      <Switch onPressedChange={onPressedChange} pressed={false}>
        Live updates
      </Switch>,
    );

    await user.click(screen.getByRole('switch'));

    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it('blocks activation while disabled', () => {
    renderUi(<Switch disabled>Live updates</Switch>);

    expect(screen.getByRole('switch')).toBeDisabled();
  });
});
