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

import {BottomSheet} from './index.js';

afterEach(() => {
  cleanup();
});

describe('BottomSheet', () => {
  it('renders nothing while closed', () => {
    renderUi(
      <BottomSheet open={false} title="Filters">
        body
      </BottomSheet>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('names the panel with its own title', () => {
    renderUi(
      <BottomSheet open title="Filters">
        body
      </BottomSheet>,
    );

    expect(screen.getByRole('dialog', {name: 'Filters'})).toHaveAttribute(
      'aria-modal',
      'true',
    );
  });

  it('dismisses on Escape', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    renderUi(
      <BottomSheet onDismiss={onDismiss} open title="Filters">
        body
      </BottomSheet>,
    );

    await user.keyboard('{Escape}');

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
