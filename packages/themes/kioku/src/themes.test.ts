import {readFile} from 'node:fs/promises';

import {
  tokenCustomProperties,
  tokenNames,
  validateThemeDefinition,
  type TokenName,
} from '@misoto22/kioku-ui';
import {describe, expect, it} from 'vitest';

import * as themeModule from './index.js';
import {kasumiTheme, mujiTheme, sumiTheme, washiTheme} from './themes.js';

const themes = [washiTheme, mujiTheme, sumiTheme, kasumiTheme] as const;

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
      if (selector.includes(':lang(zh)')) {
        return options.language === 'zh';
      }
      if (selector.includes("[data-density='standard']")) {
        return options.density === 'standard';
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
  options: {density?: 'standard'; language?: 'zh'} = {},
) {
  const css = await readFile(new URL('./theme.css', import.meta.url), 'utf8');
  const declarations = declarationsFor(cssBlocks(css), id, options);
  const theme = themes.find((candidate) => candidate.id === id);
  const privateName = privateTokenReference(theme?.tokens[tokenName] ?? '');

  return resolvePrivateValue(privateName ?? '', declarations);
}

function lightDarkHexPair(value: string | undefined) {
  const match = value?.match(
    /light-dark\(\s*(#[0-9a-f]{6})\s*,\s*(#[0-9a-f]{6})\s*\)/i,
  );
  if (!match?.[1] || !match[2]) {
    throw new Error(`Expected a light-dark hex pair, received ${value}`);
  }
  return [match[1], match[2]] as const;
}

function relativeLuminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    ?.map((value) => Number.parseInt(value, 16) / 255);
  if (!channels || channels.length !== 3) {
    throw new Error(`Expected a six-digit hex color, received ${hex}`);
  }
  const [red = 0, green = 0, blue = 0] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string) {
  const luminances = [
    relativeLuminance(foreground),
    relativeLuminance(background),
  ].sort((left, right) => right - left);
  return ((luminances[0] ?? 0) + 0.05) / ((luminances[1] ?? 0) + 0.05);
}

/* Alpha-composite `foreground` at `alpha` over an opaque `background`. Under
   frost the true background is whatever the host drew, so the only contrast
   claim worth making is the one that survives the extremes. */
function compositeOver(foreground: string, alpha: number, background: string) {
  const channels = (hex: string) =>
    (hex.slice(1).match(/.{2}/g) ?? []).map((value) =>
      Number.parseInt(value, 16),
    );
  const [over, under] = [channels(foreground), channels(background)];

  return `#${over
    .map((value, index) =>
      Math.round(alpha * value + (1 - alpha) * (under[index] ?? 0))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

describe('Kioku themes', () => {
  it.each(themes)('fulfills the complete token contract for $id', (theme) => {
    expect(validateThemeDefinition(theme)).toEqual([]);
  });

  it('publishes only host-selectable themes, without persistence or defaults', () => {
    expect(Object.keys(themeModule).sort()).toEqual([
      'kasumiTheme',
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
      {id: 'kasumi', label: 'Kasumi'},
    ]);
  });

  it('gives every theme its own skin-specific semantic token dictionary', () => {
    expect(new Set(themes.map(({tokens}) => tokens)).size).toBe(4);

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

  it('keeps muted text at AA contrast on canvas and surface in both modes', async () => {
    for (const theme of themes) {
      const muted = lightDarkHexPair(
        await resolveThemeValue(theme.id, 'color.textMuted'),
      );
      const backgrounds = await Promise.all(
        (['color.canvas', 'color.surface'] as const).map(async (tokenName) =>
          lightDarkHexPair(await resolveThemeValue(theme.id, tokenName)),
        ),
      );

      for (const [modeIndex, foreground] of muted.entries()) {
        for (const background of backgrounds) {
          expect(
            contrastRatio(foreground, background[modeIndex] ?? ''),
            `${theme.id} muted text fails AA in mode ${modeIndex}`,
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it('implements the approved shared geometry and type scale', async () => {
    for (const theme of themes) {
      expect(await resolveThemeValue(theme.id, 'spacing.xs')).toBe('3px');
      expect(await resolveThemeValue(theme.id, 'spacing.sm')).toBe('6px');
      expect(await resolveThemeValue(theme.id, 'spacing.md')).toBe('10px');
      expect(await resolveThemeValue(theme.id, 'spacing.lg')).toBe('14px');
      expect(await resolveThemeValue(theme.id, 'spacing.xl')).toBe('20px');
      expect(await resolveThemeValue(theme.id, 'spacing.2xl')).toBe('28px');
      expect(await resolveThemeValue(theme.id, 'border.width')).toBe('1px');
      expect(await resolveThemeValue(theme.id, 'border.style')).toBe('solid');
      expect(await resolveThemeValue(theme.id, 'size.controlSm')).toBe('24px');
      expect(await resolveThemeValue(theme.id, 'size.controlMd')).toBe('28px');
      expect(await resolveThemeValue(theme.id, 'size.controlLg')).toBe('32px');
      expect(await resolveThemeValue(theme.id, 'size.hitTarget')).toBe('44px');
      expect(await resolveThemeValue(theme.id, 'typography.fontSizeXs')).toBe(
        '11px',
      );
      expect(await resolveThemeValue(theme.id, 'typography.fontSizeSm')).toBe(
        '12.5px',
      );
      expect(await resolveThemeValue(theme.id, 'typography.fontSizeMd')).toBe(
        '13.5px',
      );
      expect(await resolveThemeValue(theme.id, 'typography.fontSizeLg')).toBe(
        '16px',
      );
      expect(await resolveThemeValue(theme.id, 'typography.fontSizeXl')).toBe(
        '27px',
      );
      expect(await resolveThemeValue(theme.id, 'typography.fontSize2xl')).toBe(
        '30px',
      );
    }
  });

  it('cuts every corner to one measurement, controls included', async () => {
    for (const theme of themes) {
      for (const role of [
        'radius.inner',
        'radius.element',
        'radius.container',
        'radius.page',
      ] as const) {
        expect(await resolveThemeValue(theme.id, role)).toBe('3px');
      }
      expect(await resolveThemeValue(theme.id, 'radius.full')).toBe('999px');
    }
  });

  it('widens the same rhythm for readers who select standard density', async () => {
    for (const theme of themes) {
      const standard = {density: 'standard'} as const;
      expect(await resolveThemeValue(theme.id, 'spacing.xs', standard)).toBe(
        '4px',
      );
      expect(await resolveThemeValue(theme.id, 'spacing.2xl', standard)).toBe(
        '38px',
      );
    }
  });

  it('keeps a card on the same sheet rather than floating it above one', async () => {
    for (const theme of themes) {
      for (const role of [
        'elevation.low',
        'elevation.medium',
        'elevation.high',
      ] as const) {
        expect(await resolveThemeValue(theme.id, role)).toContain('0 0 0 1px');
      }
    }
  });

  it('tints paper grain per skin and leaves sumi without any', async () => {
    for (const id of ['washi', 'muji'] as const) {
      const grain = await resolveThemeValue(id, 'texture.grain');
      expect(grain, `${id} draws no grain`).toMatch(
        /light-dark\(\s*rgb\([^)]*\/[^)]*\),\s*rgb\([^)]*\/[^)]*\)\s*\)/,
      );
    }
    expect(await resolveThemeValue('sumi', 'texture.grain')).toBe(
      'light-dark(transparent, transparent)',
    );
  });

  it('keeps every washi light surface off white, paper being the point', async () => {
    for (const role of [
      'color.canvas',
      'color.surface',
      'color.surfaceRaised',
      'color.surfaceMuted',
    ] as const) {
      const [light] = lightDarkHexPair(await resolveThemeValue('washi', role));
      expect(light.toUpperCase(), `washi ${role} is white`).not.toBe('#FFFFFF');
    }
  });

  it('implements the approved Washi light palette and alpha overlays', async () => {
    expect(
      (await resolveThemeValue('washi', 'color.canvas'))?.toUpperCase(),
    ).toContain('LIGHT-DARK(#EFEBE0,');
    expect(
      (await resolveThemeValue('washi', 'color.surface'))?.toUpperCase(),
    ).toContain('LIGHT-DARK(#F6F3E9,');
    expect(
      (await resolveThemeValue('washi', 'color.surfaceMuted'))?.toUpperCase(),
    ).toContain('LIGHT-DARK(#E7E2D3,');
    expect(
      (await resolveThemeValue('washi', 'color.text'))?.toUpperCase(),
    ).toContain('LIGHT-DARK(#26221C,');
    expect(
      (await resolveThemeValue('washi', 'color.textSecondary'))?.toUpperCase(),
    ).toContain('LIGHT-DARK(#5D574C,');
    expect(
      (await resolveThemeValue('washi', 'color.accent'))?.toUpperCase(),
    ).toContain('LIGHT-DARK(#2F5D8A,');
    expect(
      (await resolveThemeValue('washi', 'color.focus'))?.toUpperCase(),
    ).toContain('LIGHT-DARK(#2F5D8A,');
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

  it('asks Japanese faces for the proportional spacing they are cut for', async () => {
    for (const theme of themes) {
      expect(
        await resolveThemeValue(theme.id, 'typography.fontFeatureSettings'),
      ).toBe("'palt' 1");
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
  /* The frost discipline. Each of these locks one rule Hermes Desktop's glass
     mode, or Apple's own recipe, paid for in production. */

  it('thins only the kasumi field roles and holds raised content above them', async () => {
    const keep = '--kioku-theme-kasumi-frost-keep';
    const raised = '--kioku-theme-kasumi-frost-raised';

    for (const role of ['color.canvas', 'color.surfaceMuted'] as const) {
      expect(
        await resolveThemeValue('kasumi', role),
        `kasumi ${role} does not thin with the lever`,
      ).toContain(keep);
    }

    for (const role of ['color.surface', 'color.surfaceRaised'] as const) {
      const value = await resolveThemeValue('kasumi', role);
      expect(value, `kasumi ${role} is not clamped`).toContain(raised);
      expect(value, `kasumi ${role} thins with the field`).not.toContain(
        `var(${keep}`,
      );
    }
  });

  it('never lets a kasumi card thin past the field beneath it', async () => {
    const css = await readFile(new URL('./theme.css', import.meta.url), 'utf8');
    const declarations = declarationsFor(cssBlocks(css), 'kasumi');

    expect(
      declarations
        .get('--kioku-theme-kasumi-frost-raised')
        ?.replaceAll(/\s+/g, ''),
    ).toBe('max(84%,var(--kioku-theme-kasumi-frost-keep,100%))');
  });

  it('never thins a kasumi border with the lever, a region always having an edge', async () => {
    /* The rim is drawn with alpha so a card reads as a pane rather than a flat
       box, but it must not follow the lever: whatever the host drew, and
       however far down the frost is dragged, two regions still have to
       separate. `interactive` is the accent and stays an exact colour. */
    for (const role of [
      'border.default',
      'border.strong',
      'border.interactive',
      'border.disabled',
    ] as const) {
      const value = await resolveThemeValue('kasumi', role);
      expect(value, `kasumi ${role} thins with the field`).not.toContain(
        '--kioku-theme-kasumi-frost',
      );
      expect(value, `kasumi ${role} carries no light and dark value`).toContain(
        'light-dark(',
      );
    }

    expect(
      lightDarkHexPair(await resolveThemeValue('kasumi', 'border.interactive')),
    ).toHaveLength(2);
  });

  it('ships the kasumi lever where the skin still reads with nothing behind it', async () => {
    const css = await readFile(new URL('./theme.css', import.meta.url), 'utf8');
    const declarations = declarationsFor(cssBlocks(css), 'kasumi');
    const keep = Number.parseInt(
      declarations.get('--kioku-theme-kasumi-frost-keep') ?? '',
      10,
    );

    expect(keep).toBeGreaterThanOrEqual(60);
    expect(keep).toBeLessThan(100);
  });

  it('leaves the opaque skins opaque, frost being kasumi and nothing else', async () => {
    for (const id of ['washi', 'muji', 'sumi'] as const) {
      for (const role of [
        'color.canvas',
        'color.surface',
        'color.surfaceRaised',
        'color.surfaceMuted',
      ] as const) {
        expect(
          await resolveThemeValue(id, role),
          `${id} ${role} carries a frost mix`,
        ).not.toContain('color-mix');
      }
    }
  });

  it('tints kasumi from an extreme rather than a mid-tone, glass being light not film', async () => {
    /* A mid-tone tint greys out whatever is behind it — that is the difference
       between glass and a coloured film, and it is what an earlier pass of this
       skin got wrong. Solving Radix's alpha equation returns a near-white, and
       Apple's navigation glass is rgba(0,0,0,0.8) rather than a dark grey. */
    const luminance = (hex: string) =>
      relativeLuminance(hex) as unknown as number;

    for (const role of ['color.canvas', 'color.surface'] as const) {
      const [light, dark] = lightDarkHexPair(
        await resolveThemeValue('kasumi', role),
      );

      expect(
        luminance(light),
        `kasumi light ${role} is a mid-tone`,
      ).toBeGreaterThan(0.85);
      expect(luminance(dark), `kasumi dark ${role} is a mid-tone`).toBeLessThan(
        0.03,
      );
    }
  });

  it('holds kasumi muted text at AA on a raised surface over any backdrop at all', async () => {
    /* The whole purpose of the max(84%, keep) clamp. Raised content never thins
       past 84%, so 16% of an arbitrary backdrop is the most that can ever reach
       it — and black and white bracket every backdrop a host can draw. Lower
       the clamp or lighten muted text and this is what notices. */
    const raisedFloor = 0.84;
    const [lightSurface, darkSurface] = lightDarkHexPair(
      await resolveThemeValue('kasumi', 'color.surface'),
    );
    const [lightMuted, darkMuted] = lightDarkHexPair(
      await resolveThemeValue('kasumi', 'color.textMuted'),
    );

    for (const [mode, surface, muted] of [
      ['light', lightSurface, lightMuted],
      ['dark', darkSurface, darkMuted],
    ] as const) {
      for (const backdrop of ['#000000', '#ffffff']) {
        expect(
          contrastRatio(muted, compositeOver(surface, raisedFloor, backdrop)),
          `kasumi ${mode} muted text fails AA on a raised surface over ${backdrop}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('holds kasumi body text at AA on the bare field at the setting it ships', async () => {
    /* The field is not clamped, so this is only true because 64% is where the
       lever ships. It is the number the README's guidance is derived from:
       drop the lever far enough and body text on the bare field stops being
       guaranteed against an adversarial backdrop. */
    const shippedKeep = 0.64;
    const [lightCanvas, darkCanvas] = lightDarkHexPair(
      await resolveThemeValue('kasumi', 'color.canvas'),
    );
    const [lightText, darkText] = lightDarkHexPair(
      await resolveThemeValue('kasumi', 'color.text'),
    );

    for (const [mode, canvas, text] of [
      ['light', lightCanvas, lightText],
      ['dark', darkCanvas, darkText],
    ] as const) {
      for (const backdrop of ['#000000', '#ffffff']) {
        expect(
          contrastRatio(text, compositeOver(canvas, shippedKeep, backdrop)),
          `kasumi ${mode} body text fails AA on the field over ${backdrop}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('carries the blur on a pseudo-element so fixed descendants keep the viewport', async () => {
    /* A backdrop-filter on the theme root would make it the containing block
       for every `position: fixed` descendant — Tooltip, Toast, ContextMenu,
       AppShell, Popover, Overlay and MobileNav. A pseudo-element has no
       descendants and so can never be one, and `isolation` opens a stacking
       context rather than a containing block. Moving the filter up onto the
       root is the regression this catches. */
    const css = await readFile(new URL('./theme.css', import.meta.url), 'utf8');
    const rules = cssBlocks(css).map((block, index) => ({
      block,
      body:
        [
          ...css
            .replaceAll(/\/\*[\s\S]*?\*\//g, '')
            .matchAll(/([^{}]+)\{([^{}]*)\}/g),
        ][index]?.[2] ?? '',
    }));
    const isKasumiRoot = ({block}: (typeof rules)[number]) =>
      block.selectors.includes("[data-theme='kasumi']");
    const isFrostLayer = ({block}: (typeof rules)[number]) =>
      block.selectors.includes("[data-theme='kasumi']::before");

    const roots = rules.filter(isKasumiRoot);
    const frost = rules.filter(isFrostLayer);

    expect(
      roots.some(({body}) => body.includes('isolation: isolate')),
      'no kasumi root opens a stacking context',
    ).toBe(true);
    expect(
      roots.every(({body}) => !body.includes('backdrop-filter')),
      'a kasumi root filters its own backdrop',
    ).toBe(true);
    expect(frost).toHaveLength(1);
    expect(frost[0]?.body).toContain('backdrop-filter');
    expect(frost[0]?.body, 'the frost paints over the content').toContain(
      'z-index: -1',
    );
    // Nothing else in the sheet may filter a backdrop either.
    expect(
      rules.filter(({body}) => body.includes('backdrop-filter')),
    ).toHaveLength(1);
  });
});
