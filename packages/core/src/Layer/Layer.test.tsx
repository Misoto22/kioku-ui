// @vitest-environment jsdom

import {cleanup, screen} from '@testing-library/react';
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

import {Layer} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Layer', () => {
  it('renders its children outside the mounting position', () => {
    const {container} = renderUi(
      <div data-testid="host">
        <Layer>
          <p>floating</p>
        </Layer>
      </div>,
    );

    expect(screen.getByText('floating')).toBeVisible();
    expect(container.querySelector('[data-testid="host"] p')).toBeNull();
  });

  it('honours an explicit portal target', () => {
    const target = document.createElement('section');
    document.body.append(target);

    renderUi(
      <Layer container={target}>
        <p>floating</p>
      </Layer>,
    );

    expect(target.textContent).toBe('floating');
    target.remove();
  });
});
