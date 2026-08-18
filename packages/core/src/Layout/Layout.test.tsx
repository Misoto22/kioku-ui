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

import {Layout} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Layout', () => {
  it('emits exactly one main region', () => {
    renderUi(<Layout>page</Layout>);

    expect(screen.getAllByRole('main')).toHaveLength(1);
  });

  it('positions every supplied region', () => {
    renderUi(
      <Layout
        aside={<p>outline</p>}
        footer={<p>footer</p>}
        header={<p>banner</p>}
        sidebar={<p>rail</p>}
      >
        page
      </Layout>,
    );

    for (const text of ['banner', 'rail', 'page', 'outline', 'footer']) {
      expect(screen.getByText(text)).toBeVisible();
    }
  });

  it('omits regions it was given no content for', () => {
    const {container} = renderUi(<Layout>page</Layout>);

    expect(container.querySelector('footer')).toBeNull();
  });
});
