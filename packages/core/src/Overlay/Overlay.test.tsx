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

import {Overlay} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Overlay', () => {
  it('renders nothing while closed', () => {
    renderUi(
      <Overlay open={false}>
        <p>panel</p>
      </Overlay>,
    );

    expect(screen.queryByText('panel')).not.toBeInTheDocument();
  });

  it('shows the wrapped surface while open', () => {
    renderUi(
      <Overlay open>
        <p>panel</p>
      </Overlay>,
    );

    expect(screen.getByText('panel')).toBeVisible();
  });

  it('dismisses on Escape', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    renderUi(
      <Overlay onDismiss={onDismiss} open>
        <p>panel</p>
      </Overlay>,
    );

    await user.keyboard('{Escape}');

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('keeps the surface open when the click lands inside it', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    renderUi(
      <Overlay onDismiss={onDismiss} open>
        <button type="button">inside</button>
      </Overlay>,
    );

    await user.click(screen.getByRole('button', {name: 'inside'}));

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('freezes the page behind it while open', () => {
    renderUi(
      <Overlay open>
        <p>panel</p>
      </Overlay>,
    );

    expect(document.body.style.overflow).toBe('hidden');
  });
});
