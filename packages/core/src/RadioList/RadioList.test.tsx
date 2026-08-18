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

import {RadioList} from './index.js';

afterEach(() => {
  cleanup();
});

const options = [
  {label: 'Public', value: 'public'},
  {label: 'Unlisted', value: 'unlisted'},
  {label: 'Private', value: 'private', disabled: true},
];

describe('RadioList', () => {
  it('announces the question before the answers', () => {
    renderUi(<RadioList legend="Visibility" options={options} />);

    expect(screen.getByRole('group', {name: 'Visibility'})).toBeVisible();
  });

  it('keeps the choices mutually exclusive', async () => {
    const user = userEvent.setup();
    renderUi(
      <RadioList defaultValue="public" legend="Visibility" options={options} />,
    );

    await user.click(screen.getByRole('radio', {name: /Unlisted/u}));

    expect(screen.getByRole('radio', {name: /Unlisted/u})).toBeChecked();
    expect(screen.getByRole('radio', {name: /Public/u})).not.toBeChecked();
  });

  it('reports the chosen value to a controlled owner', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderUi(
      <RadioList
        legend="Visibility"
        onValueChange={onValueChange}
        options={options}
        value="public"
      />,
    );

    await user.click(screen.getByRole('radio', {name: /Unlisted/u}));

    expect(onValueChange).toHaveBeenCalledWith('unlisted');
  });

  it('blocks a disabled option', () => {
    renderUi(<RadioList legend="Visibility" options={options} />);

    expect(screen.getByRole('radio', {name: /Private/u})).toBeDisabled();
  });
});
