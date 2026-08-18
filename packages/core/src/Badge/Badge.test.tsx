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

import {Badge} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Badge', () => {
  it('keeps every badge tone visible', () => {
    renderUi(
      <>
        <Badge>Neutral</Badge>
        <Badge tone="info">Information</Badge>
        <Badge tone="success">Available</Badge>
        <Badge tone="warning">Attention</Badge>
        <Badge tone="danger">Unavailable</Badge>
      </>,
    );

    for (const label of [
      'Neutral',
      'Information',
      'Available',
      'Attention',
      'Unavailable',
    ]) {
      expect(screen.getByText(label)).toBeVisible();
    }
  });
});
