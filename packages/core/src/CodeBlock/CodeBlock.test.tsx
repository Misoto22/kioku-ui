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

import {CodeBlock} from './index.js';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('CodeBlock', () => {
  it('shows the source', () => {
    renderUi(<CodeBlock code="pnpm install" />);

    expect(screen.getByText('pnpm install')).toBeVisible();
  });

  it('records the language it was given', () => {
    const {container} = renderUi(
      <CodeBlock code="pnpm install" language="bash" />,
    );

    expect(container.querySelector('code')).toHaveAttribute(
      'data-language',
      'bash',
    );
  });

  it('copies the source and reports the result', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', {clipboard: {writeText}});

    renderUi(<CodeBlock code="pnpm install" />);
    fireEvent.click(screen.getByRole('button', {name: 'Copy'}));

    expect(writeText).toHaveBeenCalledWith('pnpm install');
    expect(await screen.findByRole('button', {name: 'Copied'})).toBeVisible();
  });
});
