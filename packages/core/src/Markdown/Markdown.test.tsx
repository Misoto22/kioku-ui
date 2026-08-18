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

import {Markdown} from './index.js';

afterEach(() => {
  cleanup();
});

describe('Markdown', () => {
  it('renders headings, paragraphs, and lists', () => {
    renderUi(
      <Markdown
        source={'## Release 12\n\nReady to publish.\n\n- One\n- Two'}
      />,
    );

    expect(screen.getByRole('heading', {name: 'Release 12'})).toBeVisible();
    expect(screen.getByText('Ready to publish.')).toBeVisible();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('renders inline emphasis, strong, and code', () => {
    const {container} = renderUi(
      <Markdown source={'A **bold** and *soft* `value`.'} />,
    );

    expect(container.querySelector('strong')).toHaveTextContent('bold');
    expect(container.querySelector('em')).toHaveTextContent('soft');
    expect(container.querySelector('code')).toHaveTextContent('value');
  });

  it('links only safe targets', () => {
    renderUi(<Markdown source="[docs](https://example.com/docs)" />);

    expect(screen.getByRole('link', {name: 'docs'})).toHaveAttribute(
      'href',
      'https://example.com/docs',
    );
  });

  it('refuses a script URL and leaves the text inert', () => {
    renderUi(<Markdown source="[click](javascript:alert(1))" />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText(/click/u)).toBeVisible();
  });

  it('never interprets raw HTML', () => {
    const {container} = renderUi(
      <Markdown source={'<img src=x onerror="alert(1)">'} />,
    );

    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText(/<img src=x/u)).toBeVisible();
  });
});
