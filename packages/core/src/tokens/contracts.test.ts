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
    ).toEqual(['color.canvas', 'color.surface', 'color.text', 'color.focus']);
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
      'elevation',
      'motion',
      'density',
    ]);
  });

  it('separates border color, width, and style roles', () => {
    expect(tokenContract.border).toEqual({
      default: 'border.default',
      strong: 'border.strong',
      width: 'border.width',
      style: 'border.style',
    });
  });

  it('defines density separately from semantic spacing', () => {
    expect(tokenContract.density).toEqual({
      controlBlock: 'density.controlBlock',
      controlInline: 'density.controlInline',
      itemGap: 'density.itemGap',
    });
    expect(tokenContract.spacing.md).toBe('spacing.md');
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
    expect(tokenCustomProperties['density.controlBlock']).toBe(
      '--kioku-ui-density-control-block',
    );
  });
});
