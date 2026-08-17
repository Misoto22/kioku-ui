type Roles<Group extends string, Role extends string> = Readonly<{
  [Name in Role]: `${Group}.${Name}`;
}>;

type ColorRole = 'canvas' | 'surface' | 'text' | 'focus';
type BorderRole = 'default' | 'strong' | 'width' | 'style';
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
  | 'fontFamilyMono'
  | 'fontSizeSm'
  | 'fontSizeMd'
  | 'fontSizeLg'
  | 'fontSizeXl'
  | 'fontWeightRegular'
  | 'fontWeightMedium'
  | 'fontWeightStrong'
  | 'lineHeightBody'
  | 'lineHeightHeading';
type SpacingRole = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type RadiusRole = 'sm' | 'md' | 'lg' | 'round';
type ElevationRole = 'low' | 'medium' | 'high';
type MotionRole =
  | 'durationFast'
  | 'durationModerate'
  | 'durationSlow'
  | 'easingStandard'
  | 'easingEmphasized';
type DensityRole = 'controlBlock' | 'controlInline' | 'itemGap';

export interface TokenContract {
  readonly color: Roles<'color', ColorRole>;
  readonly border: Roles<'border', BorderRole>;
  readonly status: Roles<'status', StatusRole>;
  readonly focus: Roles<'focus', FocusRole>;
  readonly typography: Roles<'typography', TypographyRole>;
  readonly spacing: Roles<'spacing', SpacingRole>;
  readonly radius: Roles<'radius', RadiusRole>;
  readonly elevation: Roles<'elevation', ElevationRole>;
  readonly motion: Roles<'motion', MotionRole>;
  readonly density: Roles<'density', DensityRole>;
}

export const tokenContract = {
  color: {
    canvas: 'color.canvas',
    surface: 'color.surface',
    text: 'color.text',
    focus: 'color.focus',
  },
  border: {
    default: 'border.default',
    strong: 'border.strong',
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
    fontFamilyMono: 'typography.fontFamilyMono',
    fontSizeSm: 'typography.fontSizeSm',
    fontSizeMd: 'typography.fontSizeMd',
    fontSizeLg: 'typography.fontSizeLg',
    fontSizeXl: 'typography.fontSizeXl',
    fontWeightRegular: 'typography.fontWeightRegular',
    fontWeightMedium: 'typography.fontWeightMedium',
    fontWeightStrong: 'typography.fontWeightStrong',
    lineHeightBody: 'typography.lineHeightBody',
    lineHeightHeading: 'typography.lineHeightHeading',
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
    sm: 'radius.sm',
    md: 'radius.md',
    lg: 'radius.lg',
    round: 'radius.round',
  },
  elevation: {
    low: 'elevation.low',
    medium: 'elevation.medium',
    high: 'elevation.high',
  },
  motion: {
    durationFast: 'motion.durationFast',
    durationModerate: 'motion.durationModerate',
    durationSlow: 'motion.durationSlow',
    easingStandard: 'motion.easingStandard',
    easingEmphasized: 'motion.easingEmphasized',
  },
  density: {
    controlBlock: 'density.controlBlock',
    controlInline: 'density.controlInline',
    itemGap: 'density.itemGap',
  },
} as const satisfies TokenContract;

type ContractGroup = (typeof tokenContract)[keyof typeof tokenContract];
type Values<Value> = Value extends unknown ? Value[keyof Value] : never;

export type TokenName = Values<ContractGroup>;

export const tokenNames = Object.freeze(
  Object.values(tokenContract).flatMap((group) => Object.values(group)),
) as readonly TokenName[];

export const density = tokenContract.density;

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
