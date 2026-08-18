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

import {MetadataList} from './index.js';

afterEach(() => {
  cleanup();
});

const entries = [
  {detail: 'Ada Lovelace', term: 'Owner'},
  {detail: '18 August 2026', term: 'Released'},
];

describe('MetadataList', () => {
  it('pairs each term with its detail', () => {
    const {container} = renderUi(<MetadataList entries={entries} />);

    expect(container.querySelectorAll('dt')).toHaveLength(2);
    expect(container.querySelectorAll('dd')).toHaveLength(2);
  });

  it('shows every fact', () => {
    renderUi(<MetadataList entries={entries} />);

    for (const text of [
      'Owner',
      'Ada Lovelace',
      'Released',
      '18 August 2026',
    ]) {
      expect(screen.getByText(text)).toBeVisible();
    }
  });
});
