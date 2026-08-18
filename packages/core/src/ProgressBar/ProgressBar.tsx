import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  track: {
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderRadius: semanticTokens.radiusFull,
    display: 'block',
    height: semanticTokens.spacingSm,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    backgroundColor: semanticTokens.colorAccent,
    display: 'block',
    height: '100%',
    transitionDuration: semanticTokens.durationModerate,
    transitionProperty: 'inline-size',
    transitionTimingFunction: semanticTokens.easingStandard,
  },
  indeterminate: {inlineSize: '40%'},
});

/** Props for a determinate or indeterminate progress track. */
export interface ProgressBarProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'className' | 'role'
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
        style={
          clamped === undefined
            ? undefined
            : {inlineSize: `${(clamped / max) * 100}%`}
        }
      />
    </div>
  );
}
