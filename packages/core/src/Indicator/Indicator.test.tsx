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

import {Indicator} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Indicator', () => {
  it('states what the mark means rather than showing a bare number', () => {
    renderUi(
      <Indicator count={3} label="3 unread messages">
        <button type="button">Inbox</button>
      </Indicator>,
    );

    expect(
      screen.getByRole('status', {name: '3 unread messages'}),
    ).toBeVisible();
  });

  it('caps the number it draws', () => {
    renderUi(
      <Indicator count={140} label="140 unread" max={99}>
        <button type="button">Inbox</button>
      </Indicator>,
    );

    expect(screen.getByText('99+')).toBeVisible();
  });

  it('shows a plain dot when there is no count', () => {
    renderUi(
      <Indicator label="Unread messages">
        <button type="button">Inbox</button>
      </Indicator>,
    );

    expect(
      screen.getByRole('status', {name: 'Unread messages'}),
    ).toBeEmptyDOMElement();
  });
});
