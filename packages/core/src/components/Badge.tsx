import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

export type StatusTone = 'info' | 'success' | 'warning' | 'danger';

const styles = stylex.create({
  base: {
    borderRadius: semanticTokens.radiusRound,
    display: 'inline-flex',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    fontWeight: semanticTokens.fontWeightMedium,
    paddingBlock: semanticTokens.spacingXs,
    paddingInline: semanticTokens.spacingSm,
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

export interface BadgeProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'className'
> {
  readonly tone?: StatusTone;
}

export function Badge({children, tone = 'info', ...props}: BadgeProps) {
  return (
    <span {...props} {...stylex.props(styles.base, styles[tone])}>
      {children}
    </span>
  );
}
