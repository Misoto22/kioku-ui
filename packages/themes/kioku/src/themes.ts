import type {ThemeDefinition} from '@misoto22/kioku-ui/theme';

type ThemeId = 'washi' | 'muji' | 'sumi';

function themeTokenReferences(id: ThemeId): ThemeDefinition['tokens'] {
  const variable = (role: string) => `var(--kioku-theme-${id}-${role})`;

  return Object.freeze({
    'color.canvas': variable('color-canvas'),
    'color.surface': variable('color-surface'),
    'color.text': variable('color-text'),
    'color.focus': variable('color-focus'),
    'border.default': variable('border-default'),
    'border.strong': variable('border-strong'),
    'border.width': variable('border-width'),
    'border.style': variable('border-style'),
    'status.infoSurface': variable('status-info-surface'),
    'status.infoText': variable('status-info-text'),
    'status.successSurface': variable('status-success-surface'),
    'status.successText': variable('status-success-text'),
    'status.warningSurface': variable('status-warning-surface'),
    'status.warningText': variable('status-warning-text'),
    'status.dangerSurface': variable('status-danger-surface'),
    'status.dangerText': variable('status-danger-text'),
    'focus.width': variable('focus-width'),
    'focus.offset': variable('focus-offset'),
    'typography.fontFamilyBody': variable('font-family-body'),
    'typography.fontFamilyHeading': variable('font-family-heading'),
    'typography.fontFamilyMono': variable('font-family-mono'),
    'typography.fontSizeSm': variable('font-size-sm'),
    'typography.fontSizeMd': variable('font-size-md'),
    'typography.fontSizeLg': variable('font-size-lg'),
    'typography.fontSizeXl': variable('font-size-xl'),
    'typography.fontWeightRegular': variable('font-weight-regular'),
    'typography.fontWeightMedium': variable('font-weight-medium'),
    'typography.fontWeightStrong': variable('font-weight-strong'),
    'typography.lineHeightBody': variable('line-height-body'),
    'typography.lineHeightHeading': variable('line-height-heading'),
    'spacing.xs': variable('spacing-xs'),
    'spacing.sm': variable('spacing-sm'),
    'spacing.md': variable('spacing-md'),
    'spacing.lg': variable('spacing-lg'),
    'spacing.xl': variable('spacing-xl'),
    'spacing.2xl': variable('spacing-2xl'),
    'radius.sm': variable('radius-sm'),
    'radius.md': variable('radius-md'),
    'radius.lg': variable('radius-lg'),
    'radius.round': variable('radius-round'),
    'elevation.low': variable('elevation-low'),
    'elevation.medium': variable('elevation-medium'),
    'elevation.high': variable('elevation-high'),
    'motion.durationFast': variable('motion-duration-fast'),
    'motion.durationModerate': variable('motion-duration-moderate'),
    'motion.durationSlow': variable('motion-duration-slow'),
    'motion.easingStandard': variable('motion-easing-standard'),
    'motion.easingEmphasized': variable('motion-easing-emphasized'),
    'density.controlBlock': variable('density-control-block'),
    'density.controlInline': variable('density-control-inline'),
    'density.itemGap': variable('density-item-gap'),
  });
}

function defineTheme(id: ThemeId, label: string): ThemeDefinition {
  return Object.freeze({
    id,
    label,
    tokens: themeTokenReferences(id),
  });
}

export const washiTheme = defineTheme('washi', 'Washi');
export const mujiTheme = defineTheme('muji', 'Muji');
export const sumiTheme = defineTheme('sumi', 'Sumi');

export const kiokuThemes = Object.freeze([
  washiTheme,
  mujiTheme,
  sumiTheme,
]) satisfies readonly ThemeDefinition[];
