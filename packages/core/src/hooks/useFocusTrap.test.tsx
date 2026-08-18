// @vitest-environment jsdom

import {cleanup, render, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import {useState} from 'react';
import {afterEach, describe, expect, it} from 'vitest';

import {useFocusTrap} from './useFocusTrap.js';

afterEach(() => {
  cleanup();
});

function TrapFixture({active}: {readonly active: boolean}) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  useFocusTrap(container, active);

  return (
    <div>
      <button type="button">outside</button>
      <div ref={setContainer}>
        <button type="button">first</button>
        <button type="button">last</button>
      </div>
    </div>
  );
}

describe('useFocusTrap', () => {
  it('moves focus into the trap when it opens', () => {
    render(<TrapFixture active />);

    expect(screen.getByRole('button', {name: 'first'})).toHaveFocus();
  });

  it('wraps forward from the last element back to the first', async () => {
    const user = userEvent.setup();
    render(<TrapFixture active />);

    screen.getByRole('button', {name: 'last'}).focus();
    await user.tab();

    expect(screen.getByRole('button', {name: 'first'})).toHaveFocus();
  });

  it('wraps backward from the first element to the last', async () => {
    const user = userEvent.setup();
    render(<TrapFixture active />);

    await user.tab({shift: true});

    expect(screen.getByRole('button', {name: 'last'})).toHaveFocus();
  });

  it('leaves focus alone while inactive', () => {
    render(<TrapFixture active={false} />);

    expect(document.body).toHaveFocus();
  });

  it('restores the previously focused element when it closes', () => {
    function Toggler() {
      const [active, setActive] = useState(true);
      return (
        <div>
          <button onClick={() => setActive(false)} type="button">
            close
          </button>
          {active ? <TrapFixture active /> : null}
        </div>
      );
    }

    const {rerender} = render(<Toggler />);
    rerender(<Toggler />);

    expect(screen.getByRole('button', {name: 'first'})).toHaveFocus();
  });
});
