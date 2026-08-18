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

import {SelectableCard} from './index.js';

afterEach(() => {
  cleanup();
});

describe('SelectableCard', () => {
  it('records a single choice by default', () => {
    renderUi(<SelectableCard label="Standard" name="plan" value="standard" />);

    expect(screen.getByRole('radio', {name: /Standard/u})).toBeInTheDocument();
  });

  it('allows several choices when asked', () => {
    renderUi(
      <SelectableCard label="Email" multiple name="notify" value="email" />,
    );

    expect(screen.getByRole('checkbox', {name: /Email/u})).toBeInTheDocument();
  });

  it('selects when the surface is clicked', async () => {
    const user = userEvent.setup();
    renderUi(
      <SelectableCard
        description="Twelve seats"
        label="Standard"
        name="plan"
        value="standard"
      />,
    );

    await user.click(screen.getByText('Twelve seats'));

    expect(screen.getByRole('radio')).toBeChecked();
  });

  it('blocks selection while disabled', () => {
    renderUi(
      <SelectableCard disabled label="Standard" name="plan" value="standard" />,
    );

    expect(screen.getByRole('radio')).toBeDisabled();
  });
});
