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

import {Button} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Button', () => {
  it('activates a Button with Space', async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    renderUi(<Button onClick={action}>Save</Button>);

    await user.tab();
    await user.keyboard(' ');

    expect(action).toHaveBeenCalledOnce();
  });
  it('exposes disabled Button behavior natively', async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    renderUi(
      <Button disabled onClick={action}>
        Save
      </Button>,
    );

    const button = screen.getByRole('button', {name: 'Save'});
    expect(button).toBeDisabled();
    await user.click(button);
    expect(action).not.toHaveBeenCalled();
  });
  it('keeps a loading Button named while preventing native activation', async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    renderUi(
      <Button data-host-prop="forwarded" loading onClick={action} size="sm">
        Save changes
      </Button>,
    );

    const button = screen.getByRole('button', {name: 'Save changes'});
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('data-host-prop', 'forwarded');
    expect(button).not.toHaveAttribute('size');
    expect(button.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    await user.click(button);
    expect(action).not.toHaveBeenCalled();
  });
});
