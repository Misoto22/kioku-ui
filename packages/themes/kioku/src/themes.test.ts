import {readFile} from 'node:fs/promises';

import {
  tokenCustomProperties,
  tokenNames,
  validateThemeDefinition,
} from '@misoto22/kioku-ui';
import {describe, expect, it} from 'vitest';

import * as themeModule from './index.js';
import {mujiTheme, sumiTheme, washiTheme} from './themes.js';

const themes = [washiTheme, mujiTheme, sumiTheme] as const;

describe('Kioku themes', () => {
  it.each(themes)('fulfills the complete token contract for $id', (theme) => {
    expect(validateThemeDefinition(theme)).toEqual([]);
  });

  it('publishes only host-selectable themes, without persistence or defaults', () => {
    expect(Object.keys(themeModule).sort()).toEqual([
      'kiokuThemes',
      'mujiTheme',
      'sumiTheme',
      'washiTheme',
    ]);
    expect(JSON.stringify(themeModule)).not.toContain('localStorage');
    expect(JSON.stringify(themeModule)).not.toContain('defaultThemeId');
  });

  it('keeps the stable public theme IDs and reader-facing names in the pack', () => {
    expect(themes.map(({id, label}) => ({id, label}))).toEqual([
      {id: 'washi', label: 'Washi'},
      {id: 'muji', label: 'Muji'},
      {id: 'sumi', label: 'Sumi'},
    ]);
  });
});

describe('compiled theme CSS', () => {
  it('supplies every semantic custom property for every theme root', async () => {
    const css = await readFile(new URL('./theme.css', import.meta.url), 'utf8');
    const blocks = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];

    for (const {id} of themes) {
      const declarations = blocks
        .filter(([, selector]) =>
          new RegExp(`\\[data-theme=['"]${id}['"]\\]`).test(selector ?? ''),
        )
        .map(([, , block]) => block)
        .join('\n');

      expect(declarations, `missing CSS block for ${id}`).not.toBe('');
      for (const tokenName of tokenNames) {
        expect(declarations).toContain(`${tokenCustomProperties[tokenName]}:`);
      }
    }
  });

  it('scopes every rule to ThemeProvider roots instead of global host selectors', async () => {
    const css = await readFile(new URL('./theme.css', import.meta.url), 'utf8');
    const withoutComments = css.replaceAll(/\/\*[\s\S]*?\*\//g, '');
    const selectors = [...withoutComments.matchAll(/([^{}]+)\{/g)].map(
      ([, selector]) => selector?.trim(),
    );

    expect(selectors.length).toBeGreaterThan(0);
    expect(
      selectors.every((selector) => selector?.includes('[data-theme=')),
    ).toBe(true);
    expect(withoutComments).not.toMatch(
      /(^|[\s,{])(html|body|:root)([\s,{:]|$)/,
    );
  });

  it('carries explicit light and dark palette values plus standard density roles', async () => {
    const css = await readFile(new URL('./theme.css', import.meta.url), 'utf8');

    expect(css.match(/light-dark\(/g)?.length).toBeGreaterThanOrEqual(36);
    for (const {id} of themes) {
      expect(css).toMatch(
        new RegExp(
          `\\[data-theme=['"]${id}['"]\\]\\[data-density=['"]standard['"]\\]`,
        ),
      );
    }
    expect(washiTheme.tokens['density.controlBlock']).toContain(
      '--kioku-theme-density-control-block',
    );
  });
});
