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
    animationName: spin,
    animationTimingFunction: semanticTokens.easingStandard,
    borderBlockEndColor: semanticTokens.borderDefault,
    borderBlockEndStyle: semanticTokens.borderStyle,
    borderBlockEndWidth: semanticTokens.borderWidth,
    borderBlockStartColor: semanticTokens.colorFocus,
    borderBlockStartStyle: semanticTokens.borderStyle,
    borderBlockStartWidth: semanticTokens.focusWidth,
    borderInlineEndColor: semanticTokens.borderDefault,
    borderInlineEndStyle: semanticTokens.borderStyle,
    borderInlineEndWidth: semanticTokens.borderWidth,
    borderInlineStartColor: semanticTokens.borderDefault,
    borderInlineStartStyle: semanticTokens.borderStyle,
    borderInlineStartWidth: semanticTokens.borderWidth,
    borderRadius: semanticTokens.radiusFull,
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
