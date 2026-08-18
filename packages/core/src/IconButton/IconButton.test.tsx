// @vitest-environment jsdom

import {cleanup, screen} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {userEvent} from '@testing-library/user-event';
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

import {IconButton} from './index.js';

afterEach(() => {
  cleanup();
});

describe('IconButton', () => {
  it('requires an accessible label for an icon-only native button', async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    renderUi(
      <IconButton aria-label="Close panel" onClick={action}>
        <span aria-hidden="true">×</span>
      </IconButton>,
    );

    const button = screen.getByRole('button', {name: 'Close panel'});
    await user.click(button);
    expect(action).toHaveBeenCalledOnce();
  });
  it('keeps a loading IconButton named while preventing native activation', async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    renderUi(
      <IconButton
        aria-label="Refresh results"
        data-host-prop="forwarded"
        loading
        onClick={action}
        size="lg"
        variant="destructive"
      >
        <span aria-hidden="true">↻</span>
      </IconButton>,
    );

    const button = screen.getByRole('button', {name: 'Refresh results'});
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('data-host-prop', 'forwarded');
    expect(button).not.toHaveAttribute('size');
    expect(button.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    await user.click(button);
    expect(action).not.toHaveBeenCalled();
  });
});
