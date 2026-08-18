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

import {TypeaheadItem} from './index.js';

afterEach(() => {
  cleanup();
});

describe('TypeaheadItem', () => {
  it('exposes option semantics', () => {
    renderUi(
      <ul role="listbox">
        <TypeaheadItem>Ada Lovelace</TypeaheadItem>
      </ul>,
    );

    expect(screen.getByRole('option', {name: 'Ada Lovelace'})).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('reports the option the combobox points at', () => {
    renderUi(
      <ul role="listbox">
        <TypeaheadItem active>Ada Lovelace</TypeaheadItem>
      </ul>,
    );

    expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'true');
  });

  it('marks an unavailable option', () => {
    renderUi(
      <ul role="listbox">
        <TypeaheadItem disabled>Ada Lovelace</TypeaheadItem>
      </ul>,
    );

    expect(screen.getByRole('option')).toHaveAttribute('aria-disabled', 'true');
  });
});
