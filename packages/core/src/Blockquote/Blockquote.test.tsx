// @vitest-environment jsdom

import {cleanup} from '@testing-library/react';
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

import {Blockquote} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Blockquote', () => {
  it('sets off the quoted text', () => {
    const {container} = renderUi(
      <Blockquote>The engine weaves patterns.</Blockquote>,
    );

    expect(container.querySelector('blockquote')).toHaveTextContent(
      'The engine weaves patterns.',
    );
  });

  it('names the source inside the quotation', () => {
    const {container} = renderUi(
      <Blockquote attribution="Ada Lovelace">
        The engine weaves patterns.
      </Blockquote>,
    );

    expect(container.querySelector('blockquote > footer')).toHaveTextContent(
      'Ada Lovelace',
    );
  });
});
