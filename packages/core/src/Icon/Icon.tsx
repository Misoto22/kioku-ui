import * as stylex from '@stylexjs/stylex';
import type {SVGAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  base: {
    display: 'inline-block',
    fill: 'currentColor',
    flexShrink: 0,
    verticalAlign: 'middle',
  },
  sizeInherit: {height: '1em', width: '1em'},
  sizeSm: {height: semanticTokens.fontSizeSm, width: semanticTokens.fontSizeSm},
  sizeMd: {height: semanticTokens.fontSizeMd, width: semanticTokens.fontSizeMd},
  sizeLg: {height: semanticTokens.fontSizeLg, width: semanticTokens.fontSizeLg},
  tonePrimary: {color: semanticTokens.colorText},
  toneSecondary: {color: semanticTokens.colorTextSecondary},
  toneMuted: {color: semanticTokens.colorTextMuted},
  toneAccent: {color: semanticTokens.colorAccent},
});

const sizes = {
  inherit: styles.sizeInherit,
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
} as const;

const tones = {
  primary: styles.tonePrimary,
  secondary: styles.toneSecondary,
  muted: styles.toneMuted,
  accent: styles.toneAccent,
} as const;

/** Square sizes an icon can occupy, aligned to the typography scale. */
export type IconSize = 'inherit' | 'sm' | 'md' | 'lg';

/** Semantic colour roles an icon can adopt. */
export type IconTone = 'inherit' | 'primary' | 'secondary' | 'muted' | 'accent';

/** Props for the product-neutral SVG container. */
export interface IconProps extends Omit<
  SVGAttributes<SVGSVGElement>,
  'aria-hidden' | 'aria-label' | 'className' | 'role'
> {
  readonly label?: string;
  readonly size?: IconSize;
  readonly tone?: IconTone;
}

/**
 * Wraps caller-supplied SVG paths so the system owns sizing, colour, and
 * accessible naming without shipping an icon set of its own.
 */
export function Icon({
  children,
  label,
  size = 'inherit',
  tone = 'inherit',
  viewBox = '0 0 24 24',
  ...props
}: IconProps) {
  const decorative = label === undefined;

  return (
    <svg
      {...props}
      aria-hidden={decorative ? 'true' : undefined}
      aria-label={decorative ? undefined : label}
      role={decorative ? undefined : 'img'}
      viewBox={viewBox}
      {...stylex.props(
        styles.base,
        sizes[size],
        tone !== 'inherit' && tones[tone],
      )}
    >
      {children}
    </svg>
  );
}
