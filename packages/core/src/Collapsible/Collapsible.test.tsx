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

import {Collapsible} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Collapsible', () => {
  it('starts folded and says so', () => {
    renderUi(<Collapsible label="Advanced">panel</Collapsible>);

    expect(screen.getByRole('button', {name: 'Advanced'})).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('reveals the panel when opened', async () => {
    const user = userEvent.setup();
    renderUi(<Collapsible label="Advanced">panel</Collapsible>);

    await user.click(screen.getByRole('button', {name: 'Advanced'}));

    expect(screen.getByRole('region', {name: 'Advanced'})).toBeVisible();
  });

  it('keeps the panel in the DOM while folded', () => {
    const {container} = renderUi(
      <Collapsible label="Advanced">panel</Collapsible>,
    );

    expect(container.textContent).toContain('panel');
  });

  it('reports the next state to a controlled owner', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderUi(
      <Collapsible label="Advanced" onOpenChange={onOpenChange} open={false}>
        panel
      </Collapsible>,
    );

    await user.click(screen.getByRole('button', {name: 'Advanced'}));

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
