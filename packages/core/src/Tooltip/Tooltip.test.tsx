// @vitest-environment jsdom

import {cleanup, screen, waitFor} from '@testing-library/react';
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

import {Tooltip} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Tooltip', () => {
  it('stays hidden until the trigger is hovered', () => {
    renderUi(
      <Tooltip content="Saves a draft" delay={0}>
        <button type="button">Save</button>
      </Tooltip>,
    );

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('describes the trigger on hover', async () => {
    const user = userEvent.setup();
    renderUi(
      <Tooltip content="Saves a draft" delay={0}>
        <button type="button">Save</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole('button', {name: 'Save'}));

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('Saves a draft');
    });
    expect(screen.getByRole('button', {name: 'Save'})).toHaveAttribute(
      'aria-describedby',
      screen.getByRole('tooltip').id,
    );
  });

  it('describes the trigger on keyboard focus', async () => {
    const user = userEvent.setup();
    renderUi(
      <Tooltip content="Saves a draft" delay={0}>
        <button type="button">Save</button>
      </Tooltip>,
    );

    await user.tab();

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeVisible();
    });
  });

  it('hides again when the pointer leaves', async () => {
    const user = userEvent.setup();
    renderUi(
      <Tooltip content="Saves a draft" delay={0}>
        <button type="button">Save</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', {name: 'Save'});
    await user.hover(trigger);
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeVisible();
    });
    await user.unhover(trigger);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('keeps the trigger own handlers working', async () => {
    const user = userEvent.setup();
    const onMouseEnter = vi.fn();
    renderUi(
      <Tooltip content="Saves a draft" delay={0}>
        <button onMouseEnter={onMouseEnter} type="button">
          Save
        </button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole('button', {name: 'Save'}));

    expect(onMouseEnter).toHaveBeenCalledTimes(1);
  });
});
