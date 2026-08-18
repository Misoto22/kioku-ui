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

import {Box} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Box', () => {
  it('renders its content with no styling of its own by default', () => {
    renderUi(<Box>content</Box>);

    expect(screen.getByText('content')).toBeVisible();
  });

  it('spends token values rather than literals', () => {
    const {container} = renderUi(
      <Box padding="lg" radius="container" surface="muted">
        content
      </Box>,
    );

    const style = container.firstElementChild?.getAttribute('style') ?? '';
    expect(style).toContain('--kioku-ui-spacing-lg');
    expect(style).toContain('--kioku-ui-color-surface-muted');
    expect(style).toContain('--kioku-ui-radius-container');
  });

  it('draws the default border on request', () => {
    const {container} = renderUi(<Box bordered>content</Box>);

    expect(container.firstElementChild?.getAttribute('style')).toContain(
      '--kioku-ui-border-default',
    );
  });
});
