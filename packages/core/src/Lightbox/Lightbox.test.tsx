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

import {Lightbox} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Lightbox', () => {
  it('renders nothing while closed', () => {
    renderUi(
      <Lightbox onDismiss={() => {}} open={false} title="Cover">
        <p>media</p>
      </Lightbox>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('names the media it shows', () => {
    renderUi(
      <Lightbox onDismiss={() => {}} open title="Release cover">
        <p>media</p>
      </Lightbox>,
    );

    expect(screen.getByRole('dialog', {name: 'Release cover'})).toHaveAttribute(
      'aria-modal',
      'true',
    );
  });

  it('dismisses through its own control', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    renderUi(
      <Lightbox onDismiss={onDismiss} open title="Release cover">
        <p>media</p>
      </Lightbox>,
    );

    await user.click(screen.getByRole('button', {name: 'Close'}));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('dismisses on Escape', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    renderUi(
      <Lightbox onDismiss={onDismiss} open title="Release cover">
        <p>media</p>
      </Lightbox>,
    );

    await user.keyboard('{Escape}');

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
