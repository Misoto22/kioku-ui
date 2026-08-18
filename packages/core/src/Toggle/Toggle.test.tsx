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

import {Toggle} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Toggle', () => {
  it('renders a switch track and an aria-hidden thumb inside the native button', () => {
    renderUi(<Toggle aria-label="Email notifications">Notifications</Toggle>);

    const toggle = screen.getByRole('switch', {
      name: 'Email notifications',
    });
    const track = toggle.firstElementChild;
    const thumb = track?.firstElementChild;

    expect(track).toHaveAttribute('aria-hidden', 'true');
    expect(thumb).toHaveAttribute('aria-hidden', 'true');
    expect(toggle).toHaveTextContent('Notifications');
  });
  it('supports uncontrolled and controlled Toggle state without bypassing disabled behavior', async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    renderUi(
      <>
        <Toggle aria-label="Uncontrolled toggle" defaultPressed />
        <Toggle
          aria-label="Controlled toggle"
          onPressedChange={onPressedChange}
          pressed={false}
        />
        <Toggle aria-label="Disabled toggle" disabled />
      </>,
    );

    const uncontrolled = screen.getByRole('switch', {
      name: 'Uncontrolled toggle',
    });
    expect(uncontrolled).toBeChecked();
    await user.click(uncontrolled);
    expect(uncontrolled).not.toBeChecked();

    const controlled = screen.getByRole('switch', {name: 'Controlled toggle'});
    await user.click(controlled);
    expect(onPressedChange).toHaveBeenCalledWith(true);
    expect(controlled).not.toBeChecked();

    const disabled = screen.getByRole('switch', {name: 'Disabled toggle'});
    expect(disabled).toBeDisabled();
    await user.click(disabled);
    expect(disabled).not.toBeChecked();
  });
});
