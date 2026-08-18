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

import {Avatar} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Avatar', () => {
  it('names the person whether or not an image loads', () => {
    renderUi(<Avatar name="Ada Lovelace" />);

    expect(screen.getByRole('img', {name: 'Ada Lovelace'})).toBeVisible();
  });

  it('falls back to initials from the first and last word', () => {
    renderUi(<Avatar name="Ada Lovelace" />);

    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('shows the likeness when one is supplied', () => {
    const {container} = renderUi(<Avatar name="Ada Lovelace" src="/ada.jpg" />);

    expect(container.querySelector('img')).toHaveAttribute('src', '/ada.jpg');
  });

  it('degrades to initials when the image fails', () => {
    const {container} = renderUi(
      <Avatar name="Ada Lovelace" src="/missing.jpg" />,
    );

    fireEvent.error(container.querySelector('img') as HTMLImageElement);

    expect(screen.getByText('AL')).toBeInTheDocument();
    expect(screen.getByRole('img', {name: 'Ada Lovelace'})).toBeVisible();
  });
});
