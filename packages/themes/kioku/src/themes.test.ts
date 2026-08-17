import {readFile} from 'node:fs/promises';

import {
  tokenCustomProperties,
  tokenNames,
  validateThemeDefinition,
  type TokenName,
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

async function resolveThemeValue(
  id: (typeof themes)[number]['id'],
  tokenName: TokenName,
  options: {language?: 'zh'} = {},
) {
  const css = await readFile(new URL('./theme.css', import.meta.url), 'utf8');
  const declarations = declarationsFor(cssBlocks(css), id, options);
  const theme = themes.find((candidate) => candidate.id === id);
  const privateName = privateTokenReference(theme?.tokens[tokenName] ?? '');

  return resolvePrivateValue(privateName ?? '', declarations);
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
        expect(
          declarations.has(tokenCustomProperties[tokenName]),
          `${theme.id} does not expose ${tokenCustomProperties[tokenName]}`,
        ).toBe(true);
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

  it('carries explicit light and dark values for every palette role', async () => {
    const css = await readFile(new URL('./theme.css', import.meta.url), 'utf8');
    const blocks = cssBlocks(css);
    const modeAwareTokens = tokenNames.filter(
      (name) =>
        name.startsWith('color.') ||
        (name.startsWith('border.') &&
          name !== 'border.width' &&
          name !== 'border.style') ||
        name.startsWith('status.') ||
        name.startsWith('elevation.'),
    );

    for (const theme of themes) {
      const declarations = declarationsFor(blocks, theme.id);

      for (const tokenName of modeAwareTokens) {
        const privateName = privateTokenReference(theme.tokens[tokenName]);
        expect(resolvePrivateValue(privateName ?? '', declarations)).toContain(
          'light-dark(',
        );
      }
    }
  });

  it('implements the approved shared geometry and type scale', async () => {
    for (const theme of themes) {
      expect(await resolveThemeValue(theme.id, 'spacing.xs')).toBe('4px');
      expect(await resolveThemeValue(theme.id, 'spacing.sm')).toBe('8px');
      expect(await resolveThemeValue(theme.id, 'spacing.md')).toBe('12px');
      expect(await resolveThemeValue(theme.id, 'spacing.lg')).toBe('16px');
      expect(await resolveThemeValue(theme.id, 'spacing.xl')).toBe('24px');
      expect(await resolveThemeValue(theme.id, 'spacing.2xl')).toBe('32px');
      expect(await resolveThemeValue(theme.id, 'size.controlSm')).toBe('28px');
      expect(await resolveThemeValue(theme.id, 'size.controlMd')).toBe('32px');
      expect(await resolveThemeValue(theme.id, 'size.controlLg')).toBe('36px');
      expect(await resolveThemeValue(theme.id, 'size.hitTarget')).toBe('44px');
      expect(await resolveThemeValue(theme.id, 'radius.inner')).toBe('4px');
      expect(await resolveThemeValue(theme.id, 'radius.element')).toBe('8px');
      expect(await resolveThemeValue(theme.id, 'radius.container')).toBe(
        '12px',
      );
      expect(await resolveThemeValue(theme.id, 'typography.fontSizeXs')).toBe(
        '12px',
      );
      expect(await resolveThemeValue(theme.id, 'typography.fontSizeSm')).toBe(
        '12px',
      );
      expect(await resolveThemeValue(theme.id, 'typography.fontSizeMd')).toBe(
        '14px',
      );
      expect(await resolveThemeValue(theme.id, 'typography.fontSizeLg')).toBe(
        '16px',
      );
      expect(await resolveThemeValue(theme.id, 'typography.fontSizeXl')).toBe(
        '20px',
      );
      expect(await resolveThemeValue(theme.id, 'typography.fontSize2xl')).toBe(
        '28px',
      );
    }
  });

  it('implements the approved Washi light palette and alpha overlays', async () => {
    expect(
      (await resolveThemeValue('washi', 'color.canvas'))?.toUpperCase(),
    ).toContain('LIGHT-DARK(#F5F4EF,');
    expect(
      (await resolveThemeValue('washi', 'color.surface'))?.toUpperCase(),
    ).toContain('LIGHT-DARK(#FFFFFF,');
    expect(
      (await resolveThemeValue('washi', 'color.surfaceMuted'))?.toUpperCase(),
    ).toContain('LIGHT-DARK(#ECEAE2,');
    expect(
      (await resolveThemeValue('washi', 'color.text'))?.toUpperCase(),
    ).toContain('LIGHT-DARK(#24251F,');
    expect(
      (await resolveThemeValue('washi', 'color.textSecondary'))?.toUpperCase(),
    ).toContain('LIGHT-DARK(#62645B,');
    expect(
      (await resolveThemeValue('washi', 'color.accent'))?.toUpperCase(),
    ).toContain('LIGHT-DARK(#4F6751,');
    expect(
      (await resolveThemeValue('washi', 'color.focus'))?.toUpperCase(),
    ).toContain('LIGHT-DARK(#315F77,');
    expect(await resolveThemeValue('washi', 'color.overlayHover')).toMatch(
      /light-dark\(\s*rgb\([^)]*\/[^)]*\),\s*rgb\([^)]*\/[^)]*\)\s*\)/,
    );
    expect(await resolveThemeValue('washi', 'color.overlayActive')).toMatch(
      /light-dark\(\s*rgb\([^)]*\/[^)]*\),\s*rgb\([^)]*\/[^)]*\)\s*\)/,
    );
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
      const display = resolvePrivateValue(
        privateTokenReference(theme.tokens['typography.fontFamilyDisplay']) ??
          '',
        chinese,
      );

      expect(body).toContain('Noto Sans SC');
      expect(body).not.toContain('Shippori Mincho');
      expect(heading).toContain('Noto Sans SC');
      expect(heading).not.toContain('Shippori Mincho');
      expect(display).toContain(
        theme.id === 'muji' ? 'Noto Sans SC' : 'Noto Serif SC',
      );
    }
  });

  it('uses sans-serif component headings and reserves serif for display type', async () => {
    for (const theme of themes) {
      const body = await resolveThemeValue(
        theme.id,
        'typography.fontFamilyBody',
      );
      const heading = await resolveThemeValue(
        theme.id,
        'typography.fontFamilyHeading',
      );
      const mono = await resolveThemeValue(
        theme.id,
        'typography.fontFamilyMono',
      );
      const display = await resolveThemeValue(
        theme.id,
        'typography.fontFamilyDisplay',
      );

      expect(body).toContain('sans-serif');
      expect(heading).toContain('sans-serif');
      expect(body).not.toMatch(/(^|,)\s*serif\s*(,|$)/);
      expect(heading).not.toMatch(/(^|,)\s*serif\s*(,|$)/);
      expect(mono).not.toMatch(/(^|,)\s*serif\s*(,|$)/);
      if (theme.id !== 'muji') {
        expect(display).toContain('serif');
      }
    }
  });
});
