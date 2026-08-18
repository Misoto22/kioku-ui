// @vitest-environment jsdom

import {cleanup, fireEvent, screen} from '@testing-library/react';
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

import {Thumbnail} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Thumbnail', () => {
  it('describes the image', () => {
    renderUi(<Thumbnail alt="Release cover" src="/cover.png" />);

    expect(screen.getByRole('img', {name: 'Release cover'})).toBeVisible();
  });

  it('degrades to text when the image fails', () => {
    const {container} = renderUi(
      <Thumbnail alt="Release cover" src="/missing.png" />,
    );

    fireEvent.error(container.querySelector('img') as HTMLImageElement);

    expect(screen.getByText('Release cover')).toBeVisible();
    expect(container.querySelector('img')).toBeNull();
  });

  it('prefers an explicit fallback over the alt text', () => {
    const {container} = renderUi(
      <Thumbnail
        alt="Release cover"
        fallback="No preview"
        src="/missing.png"
      />,
    );

    fireEvent.error(container.querySelector('img') as HTMLImageElement);

    expect(screen.getByText('No preview')).toBeVisible();
  });
});
