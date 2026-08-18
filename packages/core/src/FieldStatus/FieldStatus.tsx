import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes, ReactNode} from 'react';

import {semanticTokens} from '../authoring.stylex.js';
import type {StatusTone} from '../Badge/index.js';

const styles = stylex.create({
  message: {
    display: 'flex',
    fontFamily: semanticTokens.fontFamilyBody,
    fontSize: semanticTokens.fontSizeSm,
    gap: semanticTokens.spacingXs,
    lineHeight: semanticTokens.lineHeightBody,
    margin: 0,
  },
  info: {color: semanticTokens.colorTextSecondary},
  success: {color: semanticTokens.statusSuccessText},
  warning: {color: semanticTokens.statusWarningText},
  danger: {color: semanticTokens.statusDangerText},
});

/** Props for a validation message attached to one control. */
export interface FieldStatusProps extends Omit<
  HTMLAttributes<HTMLParagraphElement>,
  'children' | 'className'
> {
  readonly children: ReactNode;
  readonly tone?: StatusTone;
}

/**
 * States the outcome of validating one control. A `danger` message announces
 * itself, because a reader who just submitted needs to hear what went wrong.
 */
export function FieldStatus({
  children,
  tone = 'info',
  ...props
}: FieldStatusProps) {
  return (
    <p
      {...props}
      {...(tone === 'danger' ? {role: 'alert'} : {})}
      {...stylex.props(styles.message, styles[tone])}
    >
      {children}
    </p>
  );
}
