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

import {Field} from './index.js';
import {TextArea} from '../TextArea/index.js';
import {TextInput} from '../TextInput/index.js';

afterEach(() => {
  cleanup();
});

describe('Field', () => {
  it('connects necessity annotations and supplies the native required default', () => {
    renderUi(
      <>
        <Field label="Email" necessity="required">
          <TextInput />
        </Field>
        <Field label="Biography" necessity="required">
          <TextArea required={false} />
        </Field>
        <Field label="Summary" necessity="required">
          <TextArea />
        </Field>
        <Field label="Nickname" necessity="optional">
          <TextInput required />
        </Field>
      </>,
    );

    expect(
      screen.getByRole('textbox', {name: /Email.*required/i}),
    ).toBeRequired();
    expect(
      screen.getByRole('textbox', {name: /Biography.*required/i}),
    ).not.toBeRequired();
    expect(
      screen.getByRole('textbox', {name: /Summary.*required/i}),
    ).toBeRequired();
    expect(
      screen.getByRole('textbox', {name: /Nickname.*optional/i}),
    ).toBeRequired();
  });
  it('connects Field label and validation message to TextInput', () => {
    renderUi(
      <Field label="Email" status="Enter a valid address">
        <TextInput />
      </Field>,
    );

    const input = screen.getByRole('textbox', {name: 'Email'});
    expect(input).toHaveAccessibleDescription('Enter a valid address');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
  it('combines field description and status for a labelled TextArea', () => {
    renderUi(
      <Field
        description="Maximum 200 characters"
        label="Summary"
        status="This field is required"
      >
        <TextArea />
      </Field>,
    );

    expect(
      screen.getByRole('textbox', {name: 'Summary'}),
    ).toHaveAccessibleDescription(
      'Maximum 200 characters This field is required',
    );
  });
});
