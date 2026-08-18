// @vitest-environment jsdom

import {cleanup, render} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {afterEach, describe, expect, it} from 'vitest';

import {focusableElements, reachableElements} from './focusableSelector.js';

afterEach(() => {
  cleanup();
});

describe('focusableElements', () => {
  it('lists reachable controls in document order', () => {
    const {container} = render(
      <div>
        <a href="/docs">docs</a>
        <button type="button">act</button>
        <input readOnly value="text" />
      </div>,
    );

    expect(
      focusableElements(container.firstElementChild as HTMLElement).map(
        (element) => element.tagName,
      ),
    ).toEqual(['A', 'BUTTON', 'INPUT']);
  });

  it('skips controls a reader cannot reach', () => {
    const {container} = render(
      <div>
        <button disabled type="button">
          disabled
        </button>
        <button aria-hidden="true" type="button">
          hidden
        </button>
        <button tabIndex={-1} type="button">
          programmatic
        </button>
        <button type="button">reachable</button>
      </div>,
    );

    expect(
      focusableElements(container.firstElementChild as HTMLElement),
    ).toHaveLength(1);
  });
});

describe('reachableElements', () => {
  it('keeps items a roving collection holds out of the tab order', () => {
    const {container} = render(
      <div role="tablist">
        <button role="tab" tabIndex={0} type="button">
          open
        </button>
        <button role="tab" tabIndex={-1} type="button">
          merged
        </button>
      </div>,
    );

    expect(
      reachableElements(container.firstElementChild as HTMLElement),
    ).toHaveLength(2);
  });

  it('still skips hidden and disabled controls', () => {
    const {container} = render(
      <div>
        <button disabled type="button">
          disabled
        </button>
        <button aria-hidden="true" tabIndex={-1} type="button">
          hidden
        </button>
        <button tabIndex={-1} type="button">
          reachable
        </button>
      </div>,
    );

    expect(
      reachableElements(container.firstElementChild as HTMLElement),
    ).toHaveLength(1);
  });
});
