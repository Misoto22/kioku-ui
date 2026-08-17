import * as stylex from '@stylexjs/stylex';
import type {HTMLAttributes} from 'react';

import {semanticTokens} from '../authoring.stylex.js';

const styles = stylex.create({
  base: {
    color: semanticTokens.colorText,
    fontFamily: semanticTokens.fontFamilyBody,
    fontWeight: semanticTokens.fontWeightRegular,
    lineHeight: semanticTokens.lineHeightBody,
    margin: 0,
  },
  sm: {fontSize: semanticTokens.fontSizeSm},
  md: {fontSize: semanticTokens.fontSizeMd},
  lg: {fontSize: semanticTokens.fontSizeLg},
});

export interface TextProps extends Omit<
  HTMLAttributes<HTMLParagraphElement>,
  'className'
> {
  readonly size?: 'sm' | 'md' | 'lg';
}

export function Text({children, size = 'md', ...props}: TextProps) {
  return (
    <p {...props} {...stylex.props(styles.base, styles[size])}>
      {children}
    </p>
  );
}
