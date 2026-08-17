import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

/** Semantic feedback tones shared by status components. */
export type StatusTone = 'info' | 'success' | 'warning' | 'danger';

/** Compact badge tones, including a non-status neutral treatment. */
export type BadgeTone = 'neutral' | StatusTone;

const styles = stylex.create({
  base: {
    borderRadius: semanticTokens.radiusFull,
    display: 'inline-flex',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    fontWeight: semanticTokens.fontWeightMedium,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
  },
  neutral: {
    backgroundColor: semanticTokens.colorSurfaceMuted,
    color: semanticTokens.colorTextSecondary,
  },
  info: {
    backgroundColor: semanticTokens.statusInfoSurface,
    color: semanticTokens.statusInfoText,
  },
  success: {
    backgroundColor: semanticTokens.statusSuccessSurface,
    color: semanticTokens.statusSuccessText,
  },
  warning: {
    backgroundColor: semanticTokens.statusWarningSurface,
    color: semanticTokens.statusWarningText,
  },
  danger: {
    backgroundColor: semanticTokens.statusDangerSurface,
    color: semanticTokens.statusDangerText,
  },
});

/** Props for compact status or category text. */
export interface BadgeProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'className'
> {
  readonly tone?: BadgeTone;
}

export function Badge({children, tone = 'neutral', ...props}: BadgeProps) {
  return (
    <span {...props} {...stylex.props(styles.base, styles[tone])}>
      {children}
    </span>
  );
}
