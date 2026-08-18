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

import {Citation} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Citation', () => {
  it('names the source', () => {
    const {container} = renderUi(<Citation>RFC 9457</Citation>);

    expect(container.querySelector('cite')).toHaveTextContent('RFC 9457');
  });

  it('links the source name when a target is supplied', () => {
    renderUi(<Citation href="/rfc">RFC 9457</Citation>);

    expect(screen.getByRole('link', {name: 'RFC 9457'})).toHaveAttribute(
      'href',
      '/rfc',
    );
  });

  it('keeps the marker out of the accessible name', () => {
    renderUi(
      <Citation href="/rfc" marker="1">
        RFC 9457
      </Citation>,
    );

    expect(screen.getByRole('link')).toHaveAccessibleName('RFC 9457');
  });
});
