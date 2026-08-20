import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import type {BadgeTone} from '../Badge/index.js';

const styles = stylex.create({
  base: {
    borderRadius: semanticTokens.radiusFull,
    display: 'inline-block',
    height: semanticTokens.spacingSm,
    width: semanticTokens.spacingSm,
  },
  // Hollow, and the only tone that is. The four status tones each say a thing
  // has happened; neutral says nothing has happened yet — queued, idle, not
  // run. A filled dot in the third ink would read as a fifth status, so this
  // one is a ring: present, but not reporting.
  neutral: {
    backgroundColor: 'transparent',
    borderColor: semanticTokens.colorTextMuted,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: `calc(1.5 * ${semanticTokens.borderWidth})`,
    boxSizing: 'border-box',
  },
  info: {backgroundColor: semanticTokens.statusInfoText},
  success: {backgroundColor: semanticTokens.statusSuccessText},
  warning: {backgroundColor: semanticTokens.statusWarningText},
  danger: {backgroundColor: semanticTokens.statusDangerText},
});

/** Props for a labelled live-status indicator using semantic status tones. */
export interface StatusDotProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'aria-label' | 'children' | 'className' | 'role'
> {
  readonly 'aria-label': string;
  readonly tone?: BadgeTone;
}

export function StatusDot({tone = 'info', ...props}: StatusDotProps) {
  return (
    <span {...props} aria-live="polite" role="status">
      <span aria-hidden="true" {...stylex.props(styles.base, styles[tone])} />
    </span>
  );
}
