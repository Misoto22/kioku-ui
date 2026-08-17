import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

export type Space = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const styles = stylex.create({
  base: {display: 'flex', flexDirection: 'column'},
  gapXs: {gap: semanticTokens.spacingXs},
  gapSm: {gap: semanticTokens.spacingSm},
  gapMd: {gap: semanticTokens.spacingMd},
  gapLg: {gap: semanticTokens.spacingLg},
  gapXl: {gap: semanticTokens.spacingXl},
  gap2xl: {gap: semanticTokens.spacing2xl},
  alignStretch: {alignItems: 'stretch'},
  alignStart: {alignItems: 'flex-start'},
  alignCenter: {alignItems: 'center'},
  alignEnd: {alignItems: 'flex-end'},
});

const gaps = {
  xs: styles.gapXs,
  sm: styles.gapSm,
  md: styles.gapMd,
  lg: styles.gapLg,
  xl: styles.gapXl,
  '2xl': styles.gap2xl,
} as const;

const aligns = {
  stretch: styles.alignStretch,
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
} as const;

export interface StackProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'className'
> {
  readonly gap?: Space;
  readonly align?: 'stretch' | 'start' | 'center' | 'end';
}

export function Stack({
  gap = 'md',
  align = 'stretch',
  children,
  ...props
}: StackProps) {
  return (
    <div {...props} {...stylex.props(styles.base, gaps[gap], aligns[align])}>
      {children}
    </div>
  );
}
