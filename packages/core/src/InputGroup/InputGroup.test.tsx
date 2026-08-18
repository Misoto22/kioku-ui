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

import {TextInput} from '../TextInput/index.js';
import {InputGroup} from './index.js';

afterEach(() => {
  cleanup();
});

describe('InputGroup', () => {
  it('places affixes either side of the control', () => {
    renderUi(
      <InputGroup prefix="AUD" suffix="/month">
        <TextInput aria-label="Price" defaultValue="120" />
      </InputGroup>,
    );

    expect(screen.getByText('AUD')).toBeVisible();
    expect(screen.getByText('/month')).toBeVisible();
    expect(screen.getByRole('textbox', {name: 'Price'})).toBeVisible();
  });

  it('keeps affixes out of the accessibility tree', () => {
    const {container} = renderUi(
      <InputGroup prefix="AUD">
        <TextInput aria-label="Price" />
      </InputGroup>,
    );

    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent(
      'AUD',
    );
  });

  it('omits an affix it was given no content for', () => {
    const {container} = renderUi(
      <InputGroup>
        <TextInput aria-label="Price" />
      </InputGroup>,
    );

    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(0);
  });
});
