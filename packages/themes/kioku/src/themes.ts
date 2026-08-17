import type {ThemeDefinition} from '@misoto22/kioku-ui/theme';

type ThemeId = 'washi' | 'muji' | 'sumi';

function themeTokenReferences(id: ThemeId): ThemeDefinition['tokens'] {
  const variable = (role: string) => `var(--kioku-theme-${id}-${role})`;

  return Object.freeze({
    'color.canvas': variable('color-canvas'),
    'color.surface': variable('color-surface'),
    'color.surfaceRaised': variable('color-surface-raised'),
    'color.surfaceMuted': variable('color-surface-muted'),
    'color.text': variable('color-text'),
    'color.textSecondary': variable('color-text-secondary'),
    'color.textMuted': variable('color-text-muted'),
    'color.textOnAccent': variable('color-text-on-accent'),
    'color.accent': variable('color-accent'),
    'color.accentHover': variable('color-accent-hover'),
    'color.accentActive': variable('color-accent-active'),
    'color.overlayHover': variable('color-overlay-hover'),
    'color.overlayActive': variable('color-overlay-active'),
    'color.disabledSurface': variable('color-disabled-surface'),
    'color.disabledText': variable('color-disabled-text'),
    'color.focus': variable('color-focus'),
    'border.default': variable('border-default'),
    'border.strong': variable('border-strong'),
    'border.interactive': variable('border-interactive'),
    'border.disabled': variable('border-disabled'),
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
    'typography.fontFamilyDisplay': variable('font-family-display'),
    'typography.fontFamilyMono': variable('font-family-mono'),
    'typography.fontSizeXs': variable('font-size-xs'),
    'typography.fontSizeSm': variable('font-size-sm'),
    'typography.fontSizeMd': variable('font-size-md'),
    'typography.fontSizeLg': variable('font-size-lg'),
    'typography.fontSizeXl': variable('font-size-xl'),
    'typography.fontSize2xl': variable('font-size-2xl'),
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
    'radius.inner': variable('radius-inner'),
    'radius.element': variable('radius-element'),
    'radius.container': variable('radius-container'),
    'radius.page': variable('radius-page'),
    'radius.full': variable('radius-full'),
    'size.controlSm': variable('size-control-sm'),
    'size.controlMd': variable('size-control-md'),
    'size.controlLg': variable('size-control-lg'),
    'size.hitTarget': variable('size-hit-target'),
    'elevation.low': variable('elevation-low'),
    'elevation.medium': variable('elevation-medium'),
    'elevation.high': variable('elevation-high'),
    'motion.durationFast': variable('motion-duration-fast'),
    'motion.durationModerate': variable('motion-duration-moderate'),
    'motion.durationSlow': variable('motion-duration-slow'),
    'motion.easingStandard': variable('motion-easing-standard'),
    'motion.easingEmphasized': variable('motion-easing-emphasized'),
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
