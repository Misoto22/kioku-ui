import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  // A bar of timber standing in for ink that has not dried yet. It does not
  // breathe, shimmer or travel: a page of placeholders that pulses turns the
  // wait into the loudest thing on the screen, and the placeholder's whole job
  // is to hold a line quietly until the line arrives.
  base: {
    backgroundColor: semanticTokens.colorSurfaceMuted,
    borderRadius: semanticTokens.radiusElement,
    // The rule of type it stands in for, not the control it might become.
    minHeight: semanticTokens.spacingMd,
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
