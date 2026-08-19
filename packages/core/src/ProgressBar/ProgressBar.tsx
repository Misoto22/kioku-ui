import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

// Carries the stub of an unknown-length task across its track: from just
// off the leading edge to just past the trailing one.
const sweep = stylex.keyframes({
  from: {transform: 'translateX(-100%)'},
  to: {transform: 'translateX(250%)'},
});

const styles = stylex.create({
  track: {
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderRadius: semanticTokens.radiusFull,
    display: 'block',
    height: semanticTokens.spacingSm,
    overflow: 'hidden',
    width: '100%',
  },
  // The track at rest is the well; the part that has been earned is full ink.
  // The accent's jobs are the focus ring, the selected mark and a link on
  // hover, and a bar filling half a track is none of the three — the same
  // reasoning the spinner's moving arc is drawn by.
  fill: {
    backgroundColor: semanticTokens.colorText,
    borderRadius: semanticTokens.radiusFull,
    display: 'block',
    height: '100%',
    transitionDuration: semanticTokens.durationModerate,
    transitionProperty: 'inline-size',
    transitionTimingFunction: semanticTokens.easingStandard,
  },
  indeterminate: {
    animationDuration: semanticTokens.durationSlow,
    animationIterationCount: 'infinite',
    animationName: {
      default: sweep,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationTimingFunction: semanticTokens.easingStandard,
    inlineSize: '40%',
  },
});

/** Props for a determinate or indeterminate progress track. */
export interface ProgressBarProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'aria-label'
  | 'aria-valuemax'
  | 'aria-valuemin'
  | 'aria-valuenow'
  | 'children'
  | 'className'
  | 'role'
> {
  readonly label: string;
  readonly max?: number;
  readonly value?: number;
}

/**
 * Reports how far a task has run. Omitting `value` reports work of unknown
 * length, which a screen reader announces as busy rather than as a percentage.
 */
export function ProgressBar({
  label,
  max = 100,
  value,
  ...props
}: ProgressBarProps) {
  const determinate = value !== undefined;
  const clamped = determinate ? Math.min(Math.max(value, 0), max) : undefined;

  return (
    <div
      {...props}
      aria-label={label}
      aria-valuemax={max}
      aria-valuemin={0}
      {...(clamped === undefined ? {} : {'aria-valuenow': clamped})}
      role="progressbar"
      {...stylex.props(styles.track)}
    >
      <span
        {...stylex.props(styles.fill, !determinate && styles.indeterminate)}
        // The width is data, so it stays inline — after stylex.props, which
        // would otherwise overwrite the style attribute it is carried in.
        style={
          clamped === undefined
            ? undefined
            : {inlineSize: `${(clamped / max) * 100}%`}
        }
      />
    </div>
  );
}
