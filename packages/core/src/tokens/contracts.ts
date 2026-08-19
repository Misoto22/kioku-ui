type Roles<Group extends string, Role extends string> = Readonly<{
  [Name in Role]: `${Group}.${Name}`;
}>;

type ColorRole =
  | 'canvas'
  | 'surface'
  | 'surfaceRaised'
  | 'surfaceMuted'
  | 'text'
  | 'textSecondary'
  | 'textMuted'
  | 'textOnAccent'
  | 'accent'
  | 'accentHover'
  | 'accentActive'
  | 'overlayHover'
  | 'overlayActive'
  | 'disabledSurface'
  | 'disabledText'
  | 'focus'
  | 'scrim';
type BorderRole =
  'default' | 'strong' | 'interactive' | 'disabled' | 'width' | 'style';
type StatusRole =
  | 'infoSurface'
  | 'infoText'
  | 'successSurface'
  | 'successText'
  | 'warningSurface'
  | 'warningText'
  | 'dangerSurface'
  | 'dangerText';
type FocusRole = 'width' | 'offset';
type TypographyRole =
  | 'fontFamilyBody'
  | 'fontFamilyHeading'
  | 'fontFamilyDisplay'
  | 'fontFamilyMono'
  | 'fontFeatureSettings'
  | 'fontSizeXs'
  | 'fontSizeSm'
  | 'fontSizeMd'
  | 'fontSizeLg'
  | 'fontSizeXl'
  | 'fontSize2xl'
  | 'fontWeightRegular'
  | 'fontWeightMedium'
  | 'fontWeightStrong'
  | 'lineHeightBody'
  | 'lineHeightHeading'
  | 'letterSpacingTitle'
  | 'letterSpacingHeading'
  | 'letterSpacingBody'
  | 'letterSpacingLabel'
  | 'letterSpacingEyebrow'
  | 'letterSpacingMono';
type SpacingRole = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type RadiusRole = 'inner' | 'element' | 'container' | 'page' | 'full';
type SizeRole = 'controlSm' | 'controlMd' | 'controlLg' | 'hitTarget';
type TextureRole = 'grain';
type ElevationRole = 'low' | 'medium' | 'high';
type MotionRole =
  | 'durationFast'
  | 'durationModerate'
  | 'durationSlow'
  | 'easingStandard'
  | 'easingEmphasized';

export interface TokenContract {
  readonly color: Roles<'color', ColorRole>;
  readonly border: Roles<'border', BorderRole>;
  readonly status: Roles<'status', StatusRole>;
  readonly focus: Roles<'focus', FocusRole>;
  readonly typography: Roles<'typography', TypographyRole>;
  readonly spacing: Roles<'spacing', SpacingRole>;
  readonly radius: Roles<'radius', RadiusRole>;
  readonly size: Roles<'size', SizeRole>;
  readonly elevation: Roles<'elevation', ElevationRole>;
  readonly texture: Roles<'texture', TextureRole>;
  readonly motion: Roles<'motion', MotionRole>;
}

export const tokenContract = {
  color: {
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
    scrim: 'color.scrim',
  },
  border: {
    default: 'border.default',
    strong: 'border.strong',
    interactive: 'border.interactive',
    disabled: 'border.disabled',
    width: 'border.width',
    style: 'border.style',
  },
  status: {
    infoSurface: 'status.infoSurface',
    infoText: 'status.infoText',
    successSurface: 'status.successSurface',
    successText: 'status.successText',
    warningSurface: 'status.warningSurface',
    warningText: 'status.warningText',
    dangerSurface: 'status.dangerSurface',
    dangerText: 'status.dangerText',
  },
  focus: {
    width: 'focus.width',
    offset: 'focus.offset',
  },
  typography: {
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
    letterSpacingTitle: 'typography.letterSpacingTitle',
    letterSpacingHeading: 'typography.letterSpacingHeading',
    letterSpacingBody: 'typography.letterSpacingBody',
    letterSpacingLabel: 'typography.letterSpacingLabel',
    letterSpacingEyebrow: 'typography.letterSpacingEyebrow',
    letterSpacingMono: 'typography.letterSpacingMono',
  },
  spacing: {
    xs: 'spacing.xs',
    sm: 'spacing.sm',
    md: 'spacing.md',
    lg: 'spacing.lg',
    xl: 'spacing.xl',
    '2xl': 'spacing.2xl',
  },
  radius: {
    inner: 'radius.inner',
    element: 'radius.element',
    container: 'radius.container',
    page: 'radius.page',
    full: 'radius.full',
  },
  size: {
    controlSm: 'size.controlSm',
    controlMd: 'size.controlMd',
    controlLg: 'size.controlLg',
    hitTarget: 'size.hitTarget',
  },
  elevation: {
    low: 'elevation.low',
    medium: 'elevation.medium',
    high: 'elevation.high',
  },
  texture: {
    grain: 'texture.grain',
  },
  motion: {
    durationFast: 'motion.durationFast',
    durationModerate: 'motion.durationModerate',
    durationSlow: 'motion.durationSlow',
    easingStandard: 'motion.easingStandard',
    easingEmphasized: 'motion.easingEmphasized',
  },
} as const satisfies TokenContract;

type ContractGroup = (typeof tokenContract)[keyof typeof tokenContract];
type Values<Value> = Value extends unknown ? Value[keyof Value] : never;

export type TokenName = Values<ContractGroup>;

export const tokenNames = Object.freeze(
  Object.values(tokenContract).flatMap((group) => Object.values(group)),
) as readonly TokenName[];

export interface ThemeDefinition {
  readonly id: string;
  readonly label: string;
  readonly tokens: Readonly<Record<TokenName, string>>;
}

export interface ThemeDefinitionCandidate {
  readonly id: string;
  readonly label?: string;
  readonly tokens: Readonly<Partial<Record<TokenName, string>>>;
}

export function validateThemeDefinition(
  theme: ThemeDefinitionCandidate,
): TokenName[] {
  return tokenNames.filter((name) => theme.tokens[name] === undefined);
}

export const tokenCustomProperties = Object.freeze(
  Object.fromEntries(
    tokenNames.map((name) => [
      name,
      `--kioku-ui-${name
        .replaceAll('.', '-')
        .replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`)}`,
    ]),
  ),
) as Readonly<Record<TokenName, `--kioku-ui-${string}`>>;
