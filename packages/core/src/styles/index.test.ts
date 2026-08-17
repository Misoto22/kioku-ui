import {readFile} from 'node:fs/promises';

import {describe, expect, it} from 'vitest';

describe('compiled CSS entry point', () => {
  it('declares the public cascade order and composes reset and StyleX CSS', async () => {
    const css = await readFile(new URL('./index.css', import.meta.url), 'utf8');

    expect(css).toContain(
      '@layer kioku-ui.reset, kioku-ui.stylex, kioku-ui.global;',
    );
    expect(css).toContain("@import './reset.css' layer(kioku-ui.reset);");
    expect(css).toContain("@import './stylex.css' layer(kioku-ui.stylex);");
  });

  it('declares semantic focus styling without a host-specific selector', async () => {
    const css = await readFile(new URL('./index.css', import.meta.url), 'utf8');

    expect(css).toContain(':focus-visible');
    expect(css).toContain('var(--kioku-ui-color-focus)');
    expect(css).toContain('var(--kioku-ui-focus-offset)');
    expect(css).toContain('var(--kioku-ui-focus-width)');
    expect(css).toContain('var(--kioku-ui-border-style)');
    expect(css).not.toMatch(/kioku[.-]skin/i);
    expect(css).not.toContain('[data-kioku');
  });
});

describe('reset CSS', () => {
  it('normalizes inheritance and honors reduced motion preferences', async () => {
    const css = await readFile(new URL('./reset.css', import.meta.url), 'utf8');

    expect(css).toContain('box-sizing: border-box');
    expect(css).toContain('font: inherit');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
