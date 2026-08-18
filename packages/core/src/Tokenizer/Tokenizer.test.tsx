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

import {Tokenizer} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Tokenizer', () => {
  it('turns typed text into a token on Enter', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderUi(
      <Tokenizer label="Tags" onValueChange={onValueChange} value={[]} />,
    );

    await user.type(
      screen.getByRole('textbox', {name: 'Tags'}),
      'release{Enter}',
    );

    expect(onValueChange).toHaveBeenCalledWith(['release']);
  });

  it('accepts a comma as a separator', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderUi(
      <Tokenizer label="Tags" onValueChange={onValueChange} value={[]} />,
    );

    await user.type(screen.getByRole('textbox', {name: 'Tags'}), 'release,');

    expect(onValueChange).toHaveBeenCalledWith(['release']);
  });

  it('refuses a duplicate token', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderUi(
      <Tokenizer
        label="Tags"
        onValueChange={onValueChange}
        value={['release']}
      />,
    );

    await user.type(
      screen.getByRole('textbox', {name: 'Tags'}),
      'release{Enter}',
    );

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('removes the last token when Backspace hits an empty field', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderUi(
      <Tokenizer
        label="Tags"
        onValueChange={onValueChange}
        value={['release', 'docs']}
      />,
    );

    await user.type(screen.getByRole('textbox', {name: 'Tags'}), '{Backspace}');

    expect(onValueChange).toHaveBeenCalledWith(['release']);
  });
});
