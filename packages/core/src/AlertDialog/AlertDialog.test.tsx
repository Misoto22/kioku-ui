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

import {AlertDialog} from './index.js';

afterEach(() => {
  cleanup();
});

describe('AlertDialog', () => {
  it('claims the alert dialog role so the decision is announced', () => {
    renderUi(
      <AlertDialog open title="Discard draft?">
        body
      </AlertDialog>,
    );

    expect(
      screen.getByRole('alertdialog', {name: 'Discard draft?'}),
    ).toBeVisible();
  });

  it('still dismisses on Escape', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    renderUi(
      <AlertDialog onDismiss={onDismiss} open title="Discard draft?">
        body
      </AlertDialog>,
    );

    await user.keyboard('{Escape}');

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('ignores a click on the scrim so the decision cannot be skipped', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    renderUi(
      <AlertDialog onDismiss={onDismiss} open title="Discard draft?">
        body
      </AlertDialog>,
    );

    const scrim = screen.getByRole('alertdialog').parentElement?.parentElement;
    await user.click(scrim as HTMLElement);

    expect(onDismiss).not.toHaveBeenCalled();
  });
});
