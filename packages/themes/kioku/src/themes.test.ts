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

interface CssBlock {
  readonly declarations: ReadonlyMap<string, string>;
  readonly selectors: readonly string[];
}

function cssBlocks(css: string): CssBlock[] {
  return [
    ...css
      .replaceAll(/\/\*[\s\S]*?\*\//g, '')
      .matchAll(/([^{}]+)\{([^{}]*)\}/g),
  ].map(([, selectorList = '', declarationList = '']) => ({
    selectors: selectorList.split(',').map((selector) => selector.trim()),
    declarations: new Map(
      [...declarationList.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(
        ([, name = '', value = '']) => [name, value.trim()],
      ),
    ),
  }));
}

function themeSelector(id: string) {
  return new RegExp(`^\\[data-theme=['"]${id}['"]\\]`);
}

function declarationsFor(
  blocks: readonly CssBlock[],
  id: string,
  options: {density?: 'standard'; language?: 'zh'} = {},
) {
  const declarations = new Map<string, string>();

  for (const block of blocks) {
    const applies = block.selectors.some((selector) => {
      if (!themeSelector(id).test(selector)) {
        return false;
      }
      if (selector.includes('[data-density=')) {
        return options.density === 'standard';
      }
      if (selector.includes(':lang(zh)')) {
        return options.language === 'zh';
      }
      return true;
    });
    if (applies) {
      for (const [name, value] of block.declarations) {
        declarations.set(name, value);
      }
    }
  }

  return declarations;
}

function privateTokenReference(value: string) {
  return value.match(/^var\(\s*(--[\w-]+)\s*\)$/)?.[1];
}

function resolvePrivateValue(
  name: string,
  declarations: ReadonlyMap<string, string>,
  seen = new Set<string>(),
): string | undefined {
  if (seen.has(name)) {
    throw new Error(`Circular theme custom property: ${name}`);
  }
  seen.add(name);

  const value = declarations.get(name);
  if (!value) {
    return undefined;
  }
  const alias = privateTokenReference(value);
  return alias ? resolvePrivateValue(alias, declarations, seen) : value;
}

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

  it('gives every theme its own skin-specific semantic token dictionary', () => {
    expect(new Set(themes.map(({tokens}) => tokens)).size).toBe(3);

    for (const theme of themes) {
      for (const tokenName of tokenNames) {
        expect(theme.tokens[tokenName]).toMatch(
          new RegExp(`^var\\(--kioku-theme-${theme.id}-`),
        );
      }
    }
  });
});

describe('compiled theme CSS', () => {
  it('supplies every semantic custom property for every theme root', async () => {
    const css = await readFile(new URL('./theme.css', import.meta.url), 'utf8');
    const blocks = cssBlocks(css);

    for (const theme of themes) {
      const declarations = declarationsFor(blocks, theme.id);

      for (const tokenName of tokenNames) {
        expect(declarations.has(tokenCustomProperties[tokenName])).toBe(true);
        const privateName = privateTokenReference(theme.tokens[tokenName]);
        expect(privateName).toBeDefined();
        expect(
          resolvePrivateValue(privateName ?? '', declarations),
          `${theme.id} does not resolve ${privateName}`,
        ).toBeDefined();
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
    const blocks = cssBlocks(css);
    const modeAwareTokens = tokenNames.filter(
      (name) =>
        name.startsWith('color.') ||
        name.startsWith('border.default') ||
        name.startsWith('border.strong') ||
        name.startsWith('status.') ||
        name.startsWith('elevation.'),
    );

    for (const theme of themes) {
      const compact = declarationsFor(blocks, theme.id);
      const standard = declarationsFor(blocks, theme.id, {
        density: 'standard',
      });

      for (const tokenName of modeAwareTokens) {
        const privateName = privateTokenReference(theme.tokens[tokenName]);
        expect(resolvePrivateValue(privateName ?? '', compact)).toContain(
          'light-dark(',
        );
      }
      expect(
        resolvePrivateValue(
          privateTokenReference(theme.tokens['density.controlBlock']) ?? '',
          compact,
        ),
      ).toBe('32px');
      expect(
        resolvePrivateValue(
          privateTokenReference(theme.tokens['density.controlBlock']) ?? '',
          standard,
        ),
      ).toBe('40px');
      expect(
        resolvePrivateValue(
          privateTokenReference(theme.tokens['density.controlInline']) ?? '',
          standard,
        ),
      ).toBe('14px');
      expect(
        resolvePrivateValue(
          privateTokenReference(theme.tokens['density.itemGap']) ?? '',
          standard,
        ),
      ).toBe('8px');
    }
  });

  it('uses complete Chinese font families inside each theme root', async () => {
    const css = await readFile(new URL('./theme.css', import.meta.url), 'utf8');
    const blocks = cssBlocks(css);

    for (const theme of themes) {
      const chinese = declarationsFor(blocks, theme.id, {language: 'zh'});
      const body = resolvePrivateValue(
        privateTokenReference(theme.tokens['typography.fontFamilyBody']) ?? '',
        chinese,
      );
      const heading = resolvePrivateValue(
        privateTokenReference(theme.tokens['typography.fontFamilyHeading']) ??
          '',
        chinese,
      );

      expect(body).toContain('Noto Sans SC');
      expect(body).not.toContain('Shippori Mincho');
      expect(heading).toContain(
        theme.id === 'muji' ? 'Noto Sans SC' : 'Noto Serif SC',
      );
      expect(heading).not.toContain('Shippori Mincho');
    }
  });
});
