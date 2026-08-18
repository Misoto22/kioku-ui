import {describe, expect, it} from 'vitest';

import {
  tokenContract,
  tokenCustomProperties,
  tokenNames,
  validateThemeDefinition,
  type TokenName,
} from './contracts.js';

const nonColorTokens = Object.fromEntries(
  tokenNames
    .filter((name) => !name.startsWith('color.'))
    .map((name) => [name, 'test-value']),
) as Partial<Record<TokenName, string>>;

describe('validateThemeDefinition', () => {
  it('reports every missing semantic color role', () => {
    expect(
      validateThemeDefinition({
        id: 'incomplete',
        label: 'Incomplete',
        tokens: nonColorTokens,
      }),
    ).toEqual([
      'color.canvas',
      'color.surface',
      'color.surfaceRaised',
      'color.surfaceMuted',
      'color.text',
      'color.textSecondary',
      'color.textMuted',
      'color.textOnAccent',
      'color.accent',
      'color.accentHover',
      'color.accentActive',
      'color.overlayHover',
      'color.overlayActive',
      'color.disabledSurface',
      'color.disabledText',
      'color.focus',
    ]);
  });

  it('reports the complete contract in stable group order', () => {
    expect(
      validateThemeDefinition({
        id: 'empty',
        label: 'Empty',
        tokens: {},
      }),
    ).toEqual(tokenNames);
  });

  it('accepts a theme that supplies every semantic role', () => {
    const tokens = Object.fromEntries(
      tokenNames.map((name) => [name, 'test-value']),
    ) as Record<TokenName, string>;

    expect(
      validateThemeDefinition({id: 'complete', label: 'Complete', tokens}),
    ).toEqual([]);
  });
});

describe('tokenContract', () => {
  it('defines every required semantic token group', () => {
    expect(Object.keys(tokenContract)).toEqual([
      'color',
      'border',
      'status',
      'focus',
      'typography',
      'spacing',
      'radius',
      'size',
      'elevation',
      'texture',
      'motion',
    ]);
  });

  it('defines the complete semantic color vocabulary', () => {
    expect(tokenContract.color).toEqual({
      canvas: 'color.canvas',
      surface: 'color.surface',
      surfaceRaised: 'color.surfaceRaised',
      surfaceMuted: 'color.surfaceMuted',
      text: 'color.text',
      textSecondary: 'color.textSecondary',
      textMuted: 'color.textMuted',
      textOnAccent: 'color.textOnAccent',
      accent: 'color.accent',
      accentHover: 'color.accentHover',
      accentActive: 'color.accentActive',
      overlayHover: 'color.overlayHover',
      overlayActive: 'color.overlayActive',
      disabledSurface: 'color.disabledSurface',
      disabledText: 'color.disabledText',
      focus: 'color.focus',
    });
  });

  it('separates border color, width, and style roles', () => {
    expect(tokenContract.border).toEqual({
      default: 'border.default',
      strong: 'border.strong',
      interactive: 'border.interactive',
      disabled: 'border.disabled',
      width: 'border.width',
      style: 'border.style',
    });
  });

  it('defines the final typography, radius, and size roles', () => {
    expect(tokenContract.typography).toEqual({
      fontFamilyBody: 'typography.fontFamilyBody',
      fontFamilyHeading: 'typography.fontFamilyHeading',
      fontFamilyDisplay: 'typography.fontFamilyDisplay',
      fontFamilyMono: 'typography.fontFamilyMono',
      fontFeatureSettings: 'typography.fontFeatureSettings',
      fontSizeXs: 'typography.fontSizeXs',
      fontSizeSm: 'typography.fontSizeSm',
      fontSizeMd: 'typography.fontSizeMd',
      fontSizeLg: 'typography.fontSizeLg',
      fontSizeXl: 'typography.fontSizeXl',
      fontSize2xl: 'typography.fontSize2xl',
      fontWeightRegular: 'typography.fontWeightRegular',
      fontWeightMedium: 'typography.fontWeightMedium',
      fontWeightStrong: 'typography.fontWeightStrong',
      lineHeightBody: 'typography.lineHeightBody',
      lineHeightHeading: 'typography.lineHeightHeading',
    });
    expect(tokenContract.radius).toEqual({
      inner: 'radius.inner',
      element: 'radius.element',
      container: 'radius.container',
      page: 'radius.page',
      full: 'radius.full',
    });
    expect(tokenContract.size).toEqual({
      controlSm: 'size.controlSm',
      controlMd: 'size.controlMd',
      controlLg: 'size.controlLg',
      hitTarget: 'size.hitTarget',
    });
    expect(tokenNames).not.toEqual(
      expect.arrayContaining(['radius.sm', 'radius.round']),
    );
    expect(Object.keys(tokenContract)).not.toContain('density');
  });

  it('maps camel-cased roles to stable kebab-cased custom properties', () => {
    expect(tokenCustomProperties['status.infoSurface']).toBe(
      '--kioku-ui-status-info-surface',
    );
    expect(tokenCustomProperties['typography.fontFamilyBody']).toBe(
      '--kioku-ui-typography-font-family-body',
    );
    expect(tokenCustomProperties['motion.durationFast']).toBe(
      '--kioku-ui-motion-duration-fast',
    );
    expect(tokenCustomProperties['color.surfaceRaised']).toBe(
      '--kioku-ui-color-surface-raised',
    );
    expect(tokenCustomProperties['typography.fontFamilyDisplay']).toBe(
      '--kioku-ui-typography-font-family-display',
    );
    expect(tokenCustomProperties['typography.fontSize2xl']).toBe(
      '--kioku-ui-typography-font-size2xl',
    );
    expect(tokenCustomProperties['size.controlMd']).toBe(
      '--kioku-ui-size-control-md',
    );
  });
});
