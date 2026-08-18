import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import type {Space} from '../Stack/index.js';

const styles = stylex.create({
  paddingXs: {padding: semanticTokens.spacingXs},
  paddingSm: {padding: semanticTokens.spacingSm},
  paddingMd: {padding: semanticTokens.spacingMd},
  paddingLg: {padding: semanticTokens.spacingLg},
  paddingXl: {padding: semanticTokens.spacingXl},
  padding2xl: {padding: semanticTokens.spacing2xl},
  canvas: {backgroundColor: semanticTokens.colorCanvas},
  surface: {backgroundColor: semanticTokens.colorSurface},
  raised: {backgroundColor: semanticTokens.colorSurfaceRaised},
  muted: {backgroundColor: semanticTokens.colorSurfaceMuted},
  radiusInner: {borderRadius: semanticTokens.radiusInner},
  radiusElement: {borderRadius: semanticTokens.radiusElement},
  radiusContainer: {borderRadius: semanticTokens.radiusContainer},
  radiusPage: {borderRadius: semanticTokens.radiusPage},
  radiusFull: {borderRadius: semanticTokens.radiusFull},
  bordered: {
    borderColor: semanticTokens.borderDefault,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
  },
});

const paddings = {
  xs: styles.paddingXs,
  sm: styles.paddingSm,
  md: styles.paddingMd,
  lg: styles.paddingLg,
  xl: styles.paddingXl,
  '2xl': styles.padding2xl,
} as const;

const surfaces = {
  canvas: styles.canvas,
  muted: styles.muted,
  raised: styles.raised,
  surface: styles.surface,
} as const;

const radii = {
  inner: styles.radiusInner,
  element: styles.radiusElement,
  container: styles.radiusContainer,
  page: styles.radiusPage,
  full: styles.radiusFull,
} as const;

/** Background roles a box can take from the token contract. */
export type BoxSurface = keyof typeof surfaces;

/** Corner treatments a box can take from the token contract. */
export type BoxRadius = keyof typeof radii;

/** Props for the plain token-aware box. */
export interface BoxProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'className'
> {
  readonly bordered?: boolean;
  readonly padding?: Space;
  readonly radius?: BoxRadius;
  readonly surface?: BoxSurface;
}

/**
 * A box with no meaning of its own, spending only token values. Reach for it
 * when a layout needs a surface or some padding and none of the named
 * containers — `Card`, `Section` — would be telling the truth about what the
 * thing is.
 */
export function Box({
  bordered = false,
  children,
  padding,
  radius,
  surface,
  ...props
}: BoxProps) {
  return (
    <div
      {...props}
      {...stylex.props(
        padding === undefined ? undefined : paddings[padding],
        surface === undefined ? undefined : surfaces[surface],
        radius === undefined ? undefined : radii[radius],
        bordered && styles.bordered,
      )}
    >
      {children}
    </div>
  );
}
