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

import {Item} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Item', () => {
  it('shows the label, description, and both slots together', () => {
    renderUi(
      <Item
        description="Updated moments ago"
        leading={<span>lead</span>}
        trailing={<span>trail</span>}
      >
        Release notes
      </Item>,
    );

    for (const label of [
      'Release notes',
      'Updated moments ago',
      'lead',
      'trail',
    ]) {
      expect(screen.getByText(label)).toBeVisible();
    }
  });

  it('omits empty slots instead of reserving space for them', () => {
    const {container} = renderUi(<Item>Release notes</Item>);

    expect(container.querySelectorAll('span')).toHaveLength(2);
  });
});
