import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import type {StatusTone} from './Badge.js';

const styles = stylex.create({
  base: {
    borderRadius: semanticTokens.radiusRound,
    display: 'inline-block',
    height: semanticTokens.spacingSm,
    width: semanticTokens.spacingSm,
  },
  info: {backgroundColor: semanticTokens.statusInfoText},
  success: {backgroundColor: semanticTokens.statusSuccessText},
  warning: {backgroundColor: semanticTokens.statusWarningText},
  danger: {backgroundColor: semanticTokens.statusDangerText},
});

export interface StatusDotProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'aria-label' | 'children' | 'className' | 'role'
> {
  readonly 'aria-label': string;
  readonly tone?: StatusTone;
}

export function StatusDot({tone = 'info', ...props}: StatusDotProps) {
  return (
    <span {...props} aria-live="polite" role="status">
      <span aria-hidden="true" {...stylex.props(styles.base, styles[tone])} />
    </span>
  );
}
