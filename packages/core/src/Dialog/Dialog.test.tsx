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

import {Dialog} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Dialog', () => {
  it('renders nothing while closed', () => {
    renderUi(
      <Dialog open={false} title="Publish">
        body
      </Dialog>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('names the surface with its own title', () => {
    renderUi(
      <Dialog open title="Publish release">
        body
      </Dialog>,
    );

    expect(
      screen.getByRole('dialog', {name: 'Publish release'}),
    ).toHaveAttribute('aria-modal', 'true');
  });

  it('describes the surface when a description is supplied', () => {
    renderUi(
      <Dialog description="This cannot be undone." open title="Publish">
        body
      </Dialog>,
    );

    expect(screen.getByRole('dialog')).toHaveAccessibleDescription(
      'This cannot be undone.',
    );
  });

  it('dismisses on Escape', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    renderUi(
      <Dialog onDismiss={onDismiss} open title="Publish">
        body
      </Dialog>,
    );

    await user.keyboard('{Escape}');

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('places footer actions inside the surface', () => {
    renderUi(
      <Dialog
        footer={<button type="button">Publish</button>}
        open
        title="Publish"
      >
        body
      </Dialog>,
    );

    expect(screen.getByRole('button', {name: 'Publish'})).toBeVisible();
  });
});
