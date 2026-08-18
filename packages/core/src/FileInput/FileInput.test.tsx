// @vitest-environment jsdom

import {cleanup, screen} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';
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

import {FileInput} from './index.js';

afterEach(() => {
  cleanup();
});

describe('FileInput', () => {
  it('states that nothing is selected yet', () => {
    renderUi(<FileInput aria-label="Attachments" />);

    expect(screen.getByText('No file selected')).toBeVisible();
  });

  it('names the chosen file in text', async () => {
    const user = userEvent.setup();
    const onFilesChange = vi.fn();
    const {container} = renderUi(
      <FileInput aria-label="Attachments" onFilesChange={onFilesChange} />,
    );

    const file = new File(['notes'], 'release.txt', {type: 'text/plain'});
    await user.upload(
      container.querySelector('input') as HTMLInputElement,
      file,
    );

    expect(screen.getByText('release.txt')).toBeVisible();
    expect(onFilesChange).toHaveBeenCalledWith([file]);
  });
});
