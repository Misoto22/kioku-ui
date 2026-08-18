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

import {Banner} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Banner', () => {
  it('announces itself politely by default', () => {
    renderUi(<Banner>Billing details expire soon.</Banner>);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Billing details expire soon.',
    );
  });

  it('raises urgency for a failure', () => {
    renderUi(<Banner tone="danger">Payment failed.</Banner>);

    expect(screen.getByRole('alert')).toHaveTextContent('Payment failed.');
  });

  it('places a follow-up action at the end', () => {
    renderUi(
      <Banner actions={<button type="button">Update</button>}>
        Billing details expire soon.
      </Banner>,
    );

    expect(screen.getByRole('button', {name: 'Update'})).toBeVisible();
  });
});
