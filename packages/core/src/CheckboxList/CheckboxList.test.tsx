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

import {CheckboxList} from './index.js';

afterEach(() => {
  cleanup();
});

const options = [
  {label: 'Email', value: 'email'},
  {label: 'Chat', value: 'chat'},
  {label: 'Post', value: 'post', disabled: true},
];

describe('CheckboxList', () => {
  it('announces the question before the answers', () => {
    renderUi(<CheckboxList legend="Notify by" options={options} />);

    expect(screen.getByRole('group', {name: 'Notify by'})).toBeVisible();
  });

  it('lets several options hold at once', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderUi(
      <CheckboxList
        legend="Notify by"
        onValueChange={onValueChange}
        options={options}
        value={['email']}
      />,
    );

    await user.click(screen.getByRole('checkbox', {name: /Chat/u}));

    expect(onValueChange).toHaveBeenCalledWith(['email', 'chat']);
  });

  it('removes an option that is unchecked again', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderUi(
      <CheckboxList
        legend="Notify by"
        onValueChange={onValueChange}
        options={options}
        value={['email', 'chat']}
      />,
    );

    await user.click(screen.getByRole('checkbox', {name: /Email/u}));

    expect(onValueChange).toHaveBeenCalledWith(['chat']);
  });

  it('blocks a disabled option', () => {
    renderUi(<CheckboxList legend="Notify by" options={options} />);

    expect(screen.getByRole('checkbox', {name: /Post/u})).toBeDisabled();
  });
});
