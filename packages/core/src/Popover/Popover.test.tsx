// @vitest-environment jsdom

import {cleanup, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import {useRef, useState} from 'react';
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

import {Popover} from './index.js';

afterEach(() => {
  cleanup();
});

function PopoverFixture({onDismiss}: {readonly onDismiss?: () => void}) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setOpen(true)} ref={anchorRef} type="button">
        open
      </button>
      <button type="button">elsewhere</button>
      <Popover
        anchorRef={anchorRef}
        onDismiss={() => {
          setOpen(false);
          onDismiss?.();
        }}
        open={open}
      >
        details
      </Popover>
    </div>
  );
}

describe('Popover', () => {
  it('stays out of the document until opened', () => {
    renderUi(<PopoverFixture />);

    expect(screen.queryByText('details')).not.toBeInTheDocument();
  });

  it('floats its content once the trigger opens it', async () => {
    const user = userEvent.setup();
    renderUi(<PopoverFixture />);

    await user.click(screen.getByRole('button', {name: 'open'}));

    expect(screen.getByRole('dialog')).toHaveTextContent('details');
  });

  it('dismisses on Escape', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    renderUi(<PopoverFixture onDismiss={onDismiss} />);

    await user.click(screen.getByRole('button', {name: 'open'}));
    await user.keyboard('{Escape}');

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('dismisses when the click lands outside the anchor and surface', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    renderUi(<PopoverFixture onDismiss={onDismiss} />);

    await user.click(screen.getByRole('button', {name: 'open'}));
    await user.click(screen.getByRole('button', {name: 'elsewhere'}));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('leaves the page scrollable because it is not modal', async () => {
    const user = userEvent.setup();
    renderUi(<PopoverFixture />);

    await user.click(screen.getByRole('button', {name: 'open'}));

    expect(document.body.style.overflow).toBe('');
  });
});
