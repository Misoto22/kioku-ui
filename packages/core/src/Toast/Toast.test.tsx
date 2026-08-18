// @vitest-environment jsdom

import {
  cleanup,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
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

import {Toast, ToastProvider, useToast} from './index.js';

afterEach(() => {
  cleanup();
});

function Raiser({duration}: {readonly duration?: number}) {
  const {show} = useToast();
  return (
    <button
      onClick={() =>
        show({
          description: 'Twelve edits kept.',
          ...(duration === undefined ? {} : {duration}),
          title: 'Draft saved',
        })
      }
      type="button"
    >
      save
    </button>
  );
}

describe('Toast', () => {
  it('states what happened', () => {
    renderUi(<Toast title="Draft saved" />);

    expect(screen.getByText('Draft saved')).toBeVisible();
  });

  it('carries an optional description and action', () => {
    renderUi(
      <Toast
        action={<button type="button">Undo</button>}
        description="Twelve edits kept."
        title="Draft saved"
      />,
    );

    expect(screen.getByText('Twelve edits kept.')).toBeVisible();
    expect(screen.getByRole('button', {name: 'Undo'})).toBeVisible();
  });
});

describe('ToastProvider', () => {
  it('announces raised notifications through a live region', async () => {
    const user = userEvent.setup();
    renderUi(
      <ToastProvider>
        <Raiser />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', {name: 'save'}));

    const region = screen.getByRole('region', {name: 'Notifications'});
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveTextContent('Draft saved');
  });

  it('clears a notification once its duration elapses', async () => {
    const user = userEvent.setup();
    renderUi(
      <ToastProvider>
        <Raiser duration={50} />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', {name: 'save'}));
    expect(screen.getByText('Draft saved')).toBeVisible();

    await waitForElementToBeRemoved(() => screen.queryByText('Draft saved'));
  });

  it('keeps a notification with no duration until it is dismissed', async () => {
    const user = userEvent.setup();
    renderUi(
      <ToastProvider>
        <Raiser duration={0} />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', {name: 'save'}));

    expect(screen.getByText('Draft saved')).toBeVisible();
  });

  it('refuses to raise a notification with no provider above it', () => {
    expect(() => renderUi(<Raiser />)).toThrow(
      'useToast must be used within a ToastProvider.',
    );
  });
});
