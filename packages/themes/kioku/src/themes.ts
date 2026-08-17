import type {ThemeDefinition} from '@misoto22/kioku-ui/theme';

const themeTokenReferences = {
  'color.canvas': 'var(--kioku-theme-color-canvas)',
  'color.surface': 'var(--kioku-theme-color-surface)',
  'color.text': 'var(--kioku-theme-color-text)',
  'color.focus': 'var(--kioku-theme-color-focus)',
  'border.default': 'var(--kioku-theme-border-default)',
  'border.strong': 'var(--kioku-theme-border-strong)',
  'border.width': 'var(--kioku-theme-border-width)',
  'border.style': 'var(--kioku-theme-border-style)',
  'status.infoSurface': 'var(--kioku-theme-status-info-surface)',
  'status.infoText': 'var(--kioku-theme-status-info-text)',
  'status.successSurface': 'var(--kioku-theme-status-success-surface)',
  'status.successText': 'var(--kioku-theme-status-success-text)',
  'status.warningSurface': 'var(--kioku-theme-status-warning-surface)',
  'status.warningText': 'var(--kioku-theme-status-warning-text)',
  'status.dangerSurface': 'var(--kioku-theme-status-danger-surface)',
  'status.dangerText': 'var(--kioku-theme-status-danger-text)',
  'focus.width': 'var(--kioku-theme-focus-width)',
  'focus.offset': 'var(--kioku-theme-focus-offset)',
  'typography.fontFamilyBody': 'var(--kioku-theme-font-family-body)',
  'typography.fontFamilyHeading': 'var(--kioku-theme-font-family-heading)',
  'typography.fontFamilyMono': 'var(--kioku-theme-font-family-mono)',
  'typography.fontSizeSm': 'var(--kioku-theme-font-size-sm)',
  'typography.fontSizeMd': 'var(--kioku-theme-font-size-md)',
  'typography.fontSizeLg': 'var(--kioku-theme-font-size-lg)',
  'typography.fontSizeXl': 'var(--kioku-theme-font-size-xl)',
  'typography.fontWeightRegular': 'var(--kioku-theme-font-weight-regular)',
  'typography.fontWeightMedium': 'var(--kioku-theme-font-weight-medium)',
  'typography.fontWeightStrong': 'var(--kioku-theme-font-weight-strong)',
  'typography.lineHeightBody': 'var(--kioku-theme-line-height-body)',
  'typography.lineHeightHeading': 'var(--kioku-theme-line-height-heading)',
  'spacing.xs': 'var(--kioku-theme-spacing-xs)',
  'spacing.sm': 'var(--kioku-theme-spacing-sm)',
  'spacing.md': 'var(--kioku-theme-spacing-md)',
  'spacing.lg': 'var(--kioku-theme-spacing-lg)',
  'spacing.xl': 'var(--kioku-theme-spacing-xl)',
  'spacing.2xl': 'var(--kioku-theme-spacing-2xl)',
  'radius.sm': 'var(--kioku-theme-radius-sm)',
  'radius.md': 'var(--kioku-theme-radius-md)',
  'radius.lg': 'var(--kioku-theme-radius-lg)',
  'radius.round': 'var(--kioku-theme-radius-round)',
  'elevation.low': 'var(--kioku-theme-elevation-low)',
  'elevation.medium': 'var(--kioku-theme-elevation-medium)',
  'elevation.high': 'var(--kioku-theme-elevation-high)',
  'motion.durationFast': 'var(--kioku-theme-motion-duration-fast)',
  'motion.durationModerate': 'var(--kioku-theme-motion-duration-moderate)',
  'motion.durationSlow': 'var(--kioku-theme-motion-duration-slow)',
  'motion.easingStandard': 'var(--kioku-theme-motion-easing-standard)',
  'motion.easingEmphasized': 'var(--kioku-theme-motion-easing-emphasized)',
  'density.controlBlock': 'var(--kioku-theme-density-control-block)',
  'density.controlInline': 'var(--kioku-theme-density-control-inline)',
  'density.itemGap': 'var(--kioku-theme-density-item-gap)',
} satisfies ThemeDefinition['tokens'];

function defineTheme(id: string, label: string): ThemeDefinition {
  return Object.freeze({
    id,
    label,
    tokens: themeTokenReferences,
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
