import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  base: {
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyBody,
    fontWeight: semanticTokens.fontWeightRegular,
    letterSpacing: semanticTokens.letterSpacingBody,
    lineHeight: semanticTokens.lineHeightBody,
    margin: 0,
  },
  sm: {fontSize: semanticTokens.fontSizeSm},
  md: {fontSize: semanticTokens.fontSizeMd},
  lg: {fontSize: semanticTokens.fontSizeLg},
  primary: {color: semanticTokens.colorText},
  secondary: {color: semanticTokens.colorTextSecondary},
  muted: {color: semanticTokens.colorTextMuted},
});

export type TextTone = 'primary' | 'secondary' | 'muted';

export interface TextProps extends Omit<
  HTMLAttributes<HTMLParagraphElement>,
  'className'
> {
  readonly size?: 'sm' | 'md' | 'lg';
  readonly tone?: TextTone;
}

export function Text({
  children,
  size = 'md',
  tone = 'primary',
  ...props
}: TextProps) {
  return (
    <p {...props} {...stylex.props(styles.base, styles[size], styles[tone])}>
      {children}
    </p>
  );
}
