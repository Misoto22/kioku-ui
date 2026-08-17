import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const spin = stylex.keyframes({
  to: {transform: 'rotate(360deg)'},
});

const styles = stylex.create({
  spinner: {
    animationDuration: semanticTokens.durationSlow,
    animationIterationCount: 'infinite',
    animationName: {
      default: spin,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationTimingFunction: semanticTokens.easingStandard,
    borderBlockStartColor: semanticTokens.colorAccent,
    borderColor: semanticTokens.colorSurfaceMuted,
    borderRadius: semanticTokens.radiusFull,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    display: 'inline-block',
    height: semanticTokens.spacingLg,
    width: semanticTokens.spacingLg,
  },
});

export interface SpinnerProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'aria-label' | 'children' | 'className' | 'role'
> {
  readonly label: string;
}

export function Spinner({label, ...props}: SpinnerProps) {
  return (
    <span {...props} aria-busy="true" aria-label={label} role="status">
      <SpinnerVisual />
    </span>
  );
}

export function SpinnerVisual() {
  return <span aria-hidden="true" {...stylex.props(styles.spinner)} />;
}
