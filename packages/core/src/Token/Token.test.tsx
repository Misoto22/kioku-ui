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

import {Token} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Token', () => {
  it('shows the value', () => {
    renderUi(<Token>Ada</Token>);

    expect(screen.getByText('Ada')).toBeVisible();
  });

  it('omits the remove control when the value cannot be cleared', () => {
    renderUi(<Token>Ada</Token>);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('names the remove control so it says which value it clears', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    renderUi(
      <Token onRemove={onRemove} removeLabel="Remove Ada">
        Ada
      </Token>,
    );

    await user.click(screen.getByRole('button', {name: 'Remove Ada'}));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
