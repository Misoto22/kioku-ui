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

import {Card} from './index.js';
import {CardFooter} from '../CardFooter/index.js';
import {CardHeader} from '../CardHeader/index.js';

afterEach(() => {
  cleanup();
});

describe('Card', () => {
  it('preserves Card article structure across elevation variants', () => {
    renderUi(
      <>
        <Card aria-label="Standard card">
          <CardHeader>Standard header</CardHeader>
          <CardFooter>Standard footer</CardFooter>
        </Card>
        <Card aria-label="Low card" elevation="low">
          Low content
        </Card>
        <Card aria-label="Medium card" elevation="medium">
          Medium content
        </Card>
      </>,
    );

    for (const name of ['Standard card', 'Low card', 'Medium card']) {
      expect(screen.getByRole('article', {name}).tagName).toBe('ARTICLE');
      expect(screen.getByRole('article', {name})).not.toHaveAttribute(
        'elevation',
      );
    }
    expect(screen.getByText('Standard header').tagName).toBe('HEADER');
    expect(screen.getByText('Standard footer').tagName).toBe('FOOTER');
  });
});
