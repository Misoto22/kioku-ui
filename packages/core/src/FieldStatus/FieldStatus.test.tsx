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

import {FieldStatus} from './index.js';

afterEach(() => {
  cleanup();
});

describe('FieldStatus', () => {
  it('states the outcome', () => {
    renderUi(<FieldStatus>Saved moments ago</FieldStatus>);

    expect(screen.getByText('Saved moments ago')).toBeVisible();
  });

  it('announces a failure so a reader hears what went wrong', () => {
    renderUi(<FieldStatus tone="danger">Enter a release number.</FieldStatus>);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Enter a release number.',
    );
  });

  it('stays quiet for non-failure tones', () => {
    renderUi(<FieldStatus tone="success">Saved</FieldStatus>);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
