import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const spin = stylex.keyframes({
  to: {transform: 'rotate(360deg)'},
});

// Two hairlines wide. At fourteen pixels a one-pixel ring is a thread: it
// reads as a control that failed to draw rather than as something turning.
const ringWidth = `calc(2 * ${semanticTokens.borderWidth})`;

const styles = stylex.create({
  // The ring at rest is the hairline rank; the arc that moves is full ink.
  // The accent's jobs are the focus ring, the selected mark and a link on
  // hover, and a spinner is none of the three.
  spinner: {
    animationDuration: semanticTokens.durationSlow,
    animationIterationCount: 'infinite',
    animationName: {
      default: spin,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    // Linear, and deliberately not the standard easing. An easing curve
    // describes a move from somewhere to somewhere; this ring never arrives,
    // so an ease-out spends the first third of every turn racing and the last
    // third drifting, then snaps back to the start.
    animationTimingFunction: 'linear',
    borderBlockStartColor: semanticTokens.colorText,
    borderColor: semanticTokens.borderDefault,
    borderRadius: semanticTokens.radiusFull,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: ringWidth,
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
