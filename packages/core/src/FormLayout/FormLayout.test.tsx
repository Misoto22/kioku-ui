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

import {Button} from '../Button/index.js';
import {TextInput} from '../TextInput/index.js';
import {FormLayout} from './index.js';

afterEach(() => {
  cleanup();
});

describe('FormLayout', () => {
  it('emits a form element around its fields', () => {
    const {container} = renderUi(
      <FormLayout>
        <TextInput aria-label="Title" />
      </FormLayout>,
    );

    expect(container.querySelector('form')).not.toBeNull();
  });

  it('places actions inside the form', () => {
    renderUi(
      <FormLayout actions={<Button>Save</Button>}>
        <TextInput aria-label="Title" />
      </FormLayout>,
    );

    expect(screen.getByRole('button', {name: 'Save'})).toBeVisible();
  });

  it('omits the action row when there is nothing to act on', () => {
    const {container} = renderUi(
      <FormLayout>
        <TextInput aria-label="Title" />
      </FormLayout>,
    );

    expect(container.querySelectorAll('form > div')).toHaveLength(0);
  });
});
