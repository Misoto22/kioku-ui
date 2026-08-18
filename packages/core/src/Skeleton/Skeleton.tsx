import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const pulse = stylex.keyframes({
  '50%': {backgroundColor: semanticTokens.colorSurface},
});

const styles = stylex.create({
  base: {
    animationDirection: 'alternate',
    animationDuration: semanticTokens.durationSlow,
    animationIterationCount: 'infinite',
    animationName: {
      default: pulse,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationTimingFunction: semanticTokens.easingStandard,
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderRadius: semanticTokens.radiusElement,
    minHeight: semanticTokens.sizeControlMd,
    width: '100%',
  },
});

export interface SkeletonProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'aria-label' | 'children' | 'className' | 'role'
> {
  readonly label?: string;
}

export function Skeleton({label, ...props}: SkeletonProps) {
  return (
    <div
      {...props}
      aria-busy={label ? 'true' : undefined}
      aria-hidden={label ? undefined : 'true'}
      aria-label={label}
      role={label ? 'status' : undefined}
      {...stylex.props(styles.base)}
    />
  );
}
