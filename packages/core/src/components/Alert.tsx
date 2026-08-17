import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import type {StatusTone} from './Badge.js';

const styles = stylex.create({
  base: {
    borderRadius: semanticTokens.radiusSm,
    borderStyle: semanticTokens.borderStyle,
    borderWidth: semanticTokens.borderWidth,
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeMd,
    lineHeight: semanticTokens.lineHeightBody,
    padding: semanticTokens.spacingMd,
  },
  info: {
    backgroundColor: semanticTokens.statusInfoSurface,
    borderColor: semanticTokens.statusInfoText,
    color: semanticTokens.statusInfoText,
  },
  success: {
    backgroundColor: semanticTokens.statusSuccessSurface,
    borderColor: semanticTokens.statusSuccessText,
    color: semanticTokens.statusSuccessText,
  },
  warning: {
    backgroundColor: semanticTokens.statusWarningSurface,
    borderColor: semanticTokens.statusWarningText,
    color: semanticTokens.statusWarningText,
  },
  danger: {
    backgroundColor: semanticTokens.statusDangerSurface,
    borderColor: semanticTokens.statusDangerText,
    color: semanticTokens.statusDangerText,
  },
});

export interface AlertProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'role'
> {
  readonly tone?: StatusTone;
}

export function Alert({children, tone = 'info', ...props}: AlertProps) {
  const isDanger = tone === 'danger';

  return (
    <div
      {...props}
      aria-live={isDanger ? 'assertive' : 'polite'}
      role={isDanger ? 'alert' : 'status'}
      {...stylex.props(styles.base, styles[tone])}
    >
      {children}
    </div>
  );
}
