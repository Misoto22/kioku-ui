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

import {MetricGrid} from './index.js';

afterEach(() => {
  cleanup();
});

describe('MetricGrid', () => {
  it('keeps native definition-list groups without overriding their semantics', () => {
    const {container} = renderUi(
      <MetricGrid
        items={[
          {detail: 'Updated recently', label: 'First metric', value: '24'},
          {label: 'Second metric', value: '18%'},
        ]}
      />,
    );

    const list = container.querySelector('dl');
    expect(list).not.toBeNull();
    expect(list).not.toHaveAttribute('role');
    expect([...list!.children].map(({tagName}) => tagName)).toEqual([
      'DIV',
      'DIV',
    ]);
    expect(
      [...list!.children].map((group) => group.getAttribute('role')),
    ).toEqual([null, null]);
    expect(
      [...list!.children].map((group) =>
        [...group.children].map(({tagName}) => tagName),
      ),
    ).toEqual([
      ['DT', 'DD', 'DD'],
      ['DT', 'DD'],
    ]);
    expect(screen.getByText('First metric').tagName).toBe('DT');
    expect(screen.getByText('24').tagName).toBe('DD');
    expect(screen.getByText('Updated recently')).toBeVisible();
  });
});
